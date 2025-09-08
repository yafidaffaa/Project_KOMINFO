const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Helper function untuk deteksi content type
const getContentType = (fileName) => {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'bmp':
      return 'image/bmp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg'; // default fallback
  }
};

// IMPROVED: Upload ke Supabase Storage dengan nama file yang aman
const uploadToSupabase = async (fileBuffer, fileName) => {
  try {
    // FIXED: Bersihkan nama file dari karakter spasi dan karakter khusus
    const cleanFileName = fileName
      .replace(/\s+/g, '-') // Replace spasi dengan dash
      .replace(/[^\w\-_.]/g, '') // Hapus karakter khusus kecuali dash, underscore, dot
      .toLowerCase();

    const uniqueFileName = `bug-photos/${uuidv4()}-${cleanFileName}`;
    const contentType = getContentType(fileName);

    console.log(`Original filename: ${fileName}`);
    console.log(`Clean filename: ${uniqueFileName}`);

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(uniqueFileName, fileBuffer, {
        contentType,
        cacheControl: '31536000', // cache 1 tahun
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Ambil public URL
    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(uniqueFileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// IMPROVED: Hapus dari Supabase Storage dengan logging dan error handling yang lebih baik
const deleteFromSupabase = async (photoUrl) => {
  try {
    console.log(`Attempting to delete photo from URL: ${photoUrl}`);
    
    if (!photoUrl || !photoUrl.includes('/storage/v1/object/public/')) {
      console.warn('Invalid photo URL for deletion:', photoUrl);
      throw new Error(`Invalid photo URL format: ${photoUrl}`);
    }

    // Extract path dari URL publik Supabase
    // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const parts = photoUrl.split('/storage/v1/object/public/')[1];
    if (!parts) {
      throw new Error(`Cannot extract path from URL: ${photoUrl}`);
    }

    const [bucketName, ...pathParts] = parts.split('/');
    const filePath = pathParts.join('/');

    console.log(`Extracted - Bucket: ${bucketName}, Path: ${filePath}`);

    // Verifikasi bucket name sesuai dengan env
    if (bucketName !== process.env.SUPABASE_BUCKET) {
      console.warn(`Bucket mismatch. Expected: ${process.env.SUPABASE_BUCKET}, Got: ${bucketName}`);
    }

    const { error } = await supabase.storage
      .from(bucketName) // Gunakan bucket dari URL, bukan dari env
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    } else {
      console.log(`File deleted successfully: ${filePath}`);
    }
  } catch (error) {
    console.error('Delete file error:', error);
    throw error; // Re-throw error agar bisa ditangkap di level atas
  }
};

// TAMBAHAN: Function untuk cleanup orphaned files di Supabase
const cleanupOrphanedFiles = async () => {
  try {
    console.log('Starting cleanup of orphaned files...');
    
    // Ambil semua file dari Supabase
    const { data: files, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .list('bug-photos', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    console.log(`Found ${files?.length || 0} files in storage`);

    // Ambil semua photo_url dari database
    const { BugPhoto } = require('../models'); // Adjust path as needed
    const dbPhotos = await BugPhoto.findAll({
      attributes: ['photo_url'],
      raw: true
    });

    const dbPhotoUrls = new Set(dbPhotos.map(p => p.photo_url));
    console.log(`Found ${dbPhotoUrls.size} photos in database`);

    // Cari file orphaned
    const orphanedFiles = [];
    for (const file of files || []) {
      const fileUrl = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(`bug-photos/${file.name}`).data.publicUrl;
      
      if (!dbPhotoUrls.has(fileUrl)) {
        orphanedFiles.push(`bug-photos/${file.name}`);
      }
    }

    console.log(`Found ${orphanedFiles.length} orphaned files`);

    // Hapus file orphaned
    if (orphanedFiles.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .remove(orphanedFiles);

      if (deleteError) {
        throw new Error(`Failed to delete orphaned files: ${deleteError.message}`);
      }

      console.log(`Successfully deleted ${orphanedFiles.length} orphaned files`);
    }

    return {
      totalFiles: files?.length || 0,
      dbPhotos: dbPhotoUrls.size,
      orphanedFiles: orphanedFiles.length,
      deletedFiles: orphanedFiles.length
    };
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
};

// Helper function untuk validasi file
const validateImageFile = (fileBuffer, fileName, maxSizeInMB = 5) => {
  // Check file size
  const fileSizeInMB = fileBuffer.length / (1024 * 1024);
  if (fileSizeInMB > maxSizeInMB) {
    throw new Error(`File terlalu besar. Maksimal ${maxSizeInMB}MB`);
  }

  // Check extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  const fileExtension = fileName.toLowerCase().split('.').pop();

  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error(`Format file tidak didukung. Gunakan: ${allowedExtensions.join(', ')}`);
  }

  // Basic file signature check (magic numbers)
  const fileSignature = fileBuffer.slice(0, 4).toString('hex').toLowerCase();
  const validSignatures = [
    'ffd8ffe0', // JPEG
    'ffd8ffe1', // JPEG
    'ffd8ffe2', // JPEG
    '89504e47', // PNG
    '47494638', // GIF
    '52494646', // WEBP (RIFF)
    '424d',     // BMP
  ];

  const isValidImage = validSignatures.some(signature =>
    fileSignature.startsWith(signature.toLowerCase())
  );

  if (!isValidImage) {
    throw new Error('File bukan gambar yang valid');
  }

  return true;
};

module.exports = {
  uploadToSupabase,
  deleteFromSupabase,
  validateImageFile,
  cleanupOrphanedFiles, // TAMBAHAN: untuk cleanup manual
};