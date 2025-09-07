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

// Upload ke Supabase Storage
const uploadToSupabase = async (fileBuffer, fileName) => {
  try {
    const uniqueFileName = `bug-photos/${uuidv4()}-${fileName}`;
    const contentType = getContentType(fileName);

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

// Hapus dari Supabase Storage
const deleteFromSupabase = async (photoUrl) => {
  try {
    if (!photoUrl || !photoUrl.includes('/storage/v1/object/public/')) {
      console.warn('Invalid photo URL for deletion:', photoUrl);
      return;
    }

    // Extract path dari URL publik Supabase
    // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const parts = photoUrl.split('/storage/v1/object/public/')[1];
    if (!parts) throw new Error('Invalid Supabase Storage URL format');

    const [bucketName, ...pathParts] = parts.split('/');
    const filePath = pathParts.join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Delete file error:', error);
    } else {
      console.log(`File deleted successfully: ${filePath}`);
    }
  } catch (error) {
    console.error('Delete file error:', error);
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
};
