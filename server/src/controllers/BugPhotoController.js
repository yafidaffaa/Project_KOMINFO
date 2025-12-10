const BugPhoto = require('../models/bug_photo');
const BugReport = require('../models/bug_report');
const BugCategory = require('../models/bug_category');
const { uploadToSupabase, deleteFromSupabase, validateImageFile } = require('../utils/supabaseUpload');

// Helper untuk cek role
const isRole = (user, ...roles) => roles.includes(user.role);

// Helper untuk cek authorization akses bug report
const checkBugReportAccess = async (req, bugReport) => {
  const user = req.user;
  
  if (isRole(user, 'admin_sa', 'admin_kategori')) return true;
  
  if (isRole(user, 'user_umum')) {
    return bugReport.nik_user === user.nik_user;
  }
  
  if (isRole(user, 'pencatat')) {
    return bugReport.nik_pencatat === user.nik_pencatat;
  }

  if (isRole(user, 'validator')) {
    const kategori = await BugCategory.findByPk(bugReport.id_kategori);
    return kategori && kategori.nik_validator === user.nik_validator;
  }

  if (isRole(user, 'teknisi')) {
    return bugReport.nik_teknisi === user.nik_teknisi;
  }

  return false;
};

// GET photos by bug report ID
const getPhotosByBugId = async (req, res) => {
  const { id_bug_report } = req.params;

  // Validasi ID bug report
  if (!id_bug_report || isNaN(id_bug_report)) {
    return res.status(400).json({ message: 'ID bug report harus berupa angka' });
  }

  try {
    const bug = await BugReport.findByPk(id_bug_report);
    if (!bug) {
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

    // Cek akses
    const hasAccess = await checkBugReportAccess(req, bug);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat foto bug report ini' });
    }

    const photos = await BugPhoto.findAll({
      where: { id_bug_report },
      order: [['urutan', 'ASC'], ['created_at', 'ASC']]
    });

    if (photos.length === 0) {
      return res.status(200).json({
        message: 'Belum ada foto untuk bug report ini',
        id_bug_report: parseInt(id_bug_report),
        total_photos: 0,
        photos: []
      });
    }

    res.status(200).json({
      message: 'Data foto bug report berhasil diambil',
      id_bug_report: parseInt(id_bug_report),
      total_photos: photos.length,
      photos: photos.map(photo => ({
        id_bug_photo: photo.id_bug_photo,
        photo_url: photo.photo_url,
        photo_name: photo.photo_name,
        urutan: photo.urutan,
        created_at: photo.created_at
      }))
    });
  } catch (error) {
    console.error('Error get photos by bug id:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil foto bug report', 
      error: error.message 
    });
  }
};

// UPLOAD photos for bug report
const uploadPhotos = async (req, res) => {
  const { id_bug_report } = req.params;
  const files = req.files || [];

  // Validasi ID bug report
  if (!id_bug_report || isNaN(id_bug_report)) {
    return res.status(400).json({ message: 'ID bug report harus berupa angka' });
  }

  // Validasi file upload
  if (files.length === 0) {
    return res.status(400).json({ message: 'Tidak ada file yang diupload' });
  }

  if (files.length > 5) {
    return res.status(400).json({ message: 'Maksimal 5 foto dapat diupload sekaligus' });
  }

  try {
    const bug = await BugReport.findByPk(id_bug_report);
    if (!bug) {
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

    // Cek upload access
    const user = req.user;
    let hasUploadAccess = false;
    
    if (isRole(user, 'admin_sa')) {
      hasUploadAccess = true;
    } else if (isRole(user, 'user_umum')) {
      hasUploadAccess = bug.nik_user === user.nik_user;
    } else if (isRole(user, 'pencatat')) {
      hasUploadAccess = bug.nik_pencatat === user.nik_pencatat;
    }

    if (!hasUploadAccess) {
      return res.status(403).json({ message: 'Akses ditolak. Hanya pembuat laporan yang dapat mengupload foto' });
    }

    // Cek jumlah foto yang sudah ada
    const existingPhotosCount = await BugPhoto.count({ where: { id_bug_report } });
    
    if (existingPhotosCount >= 5) {
      return res.status(400).json({ 
        message: 'Bug report sudah memiliki 5 foto (maksimal). Hapus foto lama untuk menambahkan foto baru' 
      });
    }

    if (existingPhotosCount + files.length > 5) {
      return res.status(400).json({ 
        message: `Total foto tidak boleh melebihi 5. Saat ini sudah ada ${existingPhotosCount} foto, akan ditambah ${files.length} foto` 
      });
    }

    // Validasi semua file sebelum upload
    for (const file of files) {
      try {
        validateImageFile(file.buffer, file.originalname, 5);
      } catch (validationError) {
        return res.status(400).json({ 
          message: `File ${file.originalname}: ${validationError.message}` 
        });
      }
    }

    // Upload semua foto
    const uploadedPhotos = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const photoUrl = await uploadToSupabase(file.buffer, file.originalname);

        const photo = await BugPhoto.create({
          id_bug_report: parseInt(id_bug_report),
          photo_url: photoUrl,
          photo_name: file.originalname,
          urutan: existingPhotosCount + i + 1
        });

        uploadedPhotos.push({
          id_bug_photo: photo.id_bug_photo,
          photo_url: photo.photo_url,
          photo_name: photo.photo_name,
          urutan: photo.urutan
        });
      }

      // Update status photo_bug jika belum ada
      if (bug.photo_bug !== 'ada') {
        await bug.update({ photo_bug: 'ada' });
      }

      res.status(201).json({
        message: 'Foto berhasil diupload',
        total_uploaded: uploadedPhotos.length,
        photos: uploadedPhotos
      });
    } catch (uploadError) {
      // Rollback: hapus foto yang sudah terupload jika terjadi error
      for (const photo of uploadedPhotos) {
        try {
          await deleteFromSupabase(photo.photo_url);
          await BugPhoto.destroy({ where: { id_bug_photo: photo.id_bug_photo } });
        } catch (rollbackError) {
          console.error('Error rollback upload:', rollbackError);
        }
      }
      throw uploadError;
    }
  } catch (error) {
    console.error('Error upload photos:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengupload foto', 
      error: error.message 
    });
  }
};

// DELETE photo
const deletePhoto = async (req, res) => {
  const { id_bug_photo } = req.params;

  // Validasi ID bug photo
  if (!id_bug_photo || isNaN(id_bug_photo)) {
    return res.status(400).json({ message: 'ID foto harus berupa angka' });
  }

  try {
    const photo = await BugPhoto.findByPk(id_bug_photo, { 
      include: [BugReport] 
    });

    if (!photo) {
      return res.status(404).json({ message: 'Foto tidak ditemukan' });
    }

    const user = req.user;
    const bug = photo.BugReport;

    // Cek delete access
    let hasDeleteAccess = false;
    
    if (isRole(user, 'admin_sa')) {
      hasDeleteAccess = true;
    } else if (isRole(user, 'user_umum')) {
      hasDeleteAccess = bug.nik_user === user.nik_user;
    } else if (isRole(user, 'pencatat')) {
      hasDeleteAccess = bug.nik_pencatat === user.nik_pencatat;
    }

    if (!hasDeleteAccess) {
      return res.status(403).json({ message: 'Akses ditolak. Hanya pembuat laporan yang dapat menghapus foto' });
    }

    // Hapus foto dari Supabase
    try {
      await deleteFromSupabase(photo.photo_url);
    } catch (supabaseError) {
      console.warn('Supabase delete warning:', supabaseError.message);
    }

    const bugReportId = photo.id_bug_report;
    
    // Hapus record foto dari database
    await photo.destroy();

    // Cek apakah masih ada foto lain
    const remainingPhotos = await BugPhoto.count({ where: { id_bug_report: bugReportId } });
    
    // Update status photo_bug jika sudah tidak ada foto
    if (remainingPhotos === 0) {
      await BugReport.update(
        { photo_bug: 'tidak ada' },
        { where: { id_bug_report: bugReportId } }
      );
    }

    res.status(200).json({ 
      message: 'Foto berhasil dihapus',
      remaining_photos: remainingPhotos
    });
  } catch (error) {
    console.error('Error delete photo:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menghapus foto', 
      error: error.message 
    });
  }
};

module.exports = {
  getPhotosByBugId,
  uploadPhotos,
  deletePhoto
};