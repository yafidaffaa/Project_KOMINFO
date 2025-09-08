const BugPhoto = require('../models/bug_photo');
const BugReport = require('../models/bug_report');
const BugCategory = require('../models/bug_category');
const { uploadToSupabase, deleteFromSupabase, validateImageFile } = require('../utils/supabaseUpload');

// Helper untuk cek role
const isRole = (user, ...roles) => roles.includes(user.role);

// Helper untuk cek authorization akses bug report
const checkBugReportAccess = async (req, bugReport) => {
  const user = req.user;
  
  if (isRole(user, 'admin_sa')) return true;
  if (isRole(user, 'admin_kategori')) return true;
  if (isRole(user, 'validator')) return true;
  if (isRole(user, 'teknisi')) return true;
  if (isRole(user, 'user_umum')) return bugReport.nik_user === user.nik_user;
  if (isRole(user, 'pencatat')) return bugReport.nik_pencatat === user.nik_pencatat;

  if (isRole(user, 'validator')) {
    const kategori = await BugCategory.findByPk(bugReport.id_bug_category);
    return kategori && kategori.nik_validator === user.nik_validator;
  }

  if (isRole(user, 'teknisi')) {
    const kategori = await BugCategory.findByPk(bugReport.id_bug_category);
    return kategori && kategori.nik_validator === user.nik_validator;
  }

  return false;
};

// GET photos by bug report ID
const getPhotosByBugId = async (req, res) => {
  try {
    const { id_bug_report } = req.params;
    const bug = await BugReport.findByPk(id_bug_report);
    if (!bug) {
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

    const hasAccess = await checkBugReportAccess(req, bug);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const photos = await BugPhoto.findAll({
      where: { id_bug_report },
      order: [['urutan', 'ASC'], ['created_at', 'ASC']]
    });

    res.json({
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
    console.error('Error getting photos:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil foto bug', 
      error: error.message 
    });
  }
};

// UPLOAD photos for bug report
const uploadPhotos = async (req, res) => {
  try {
    const { id_bug_report } = req.params;
    const files = req.files || [];
    
    if (files.length === 0) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }
    if (files.length > 5) {
      return res.status(400).json({ message: 'Maksimal 5 foto diperbolehkan' });
    }

    const bug = await BugReport.findByPk(id_bug_report);
    if (!bug) {
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

    // cek upload access
    const user = req.user;
    let hasUploadAccess = false;
    if (isRole(user, 'admin_sa')) hasUploadAccess = true;
    else if (isRole(user, 'user_umum')) hasUploadAccess = bug.nik_user === user.nik_user;
    else if (isRole(user, 'pencatat')) hasUploadAccess = bug.nik_pencatat === user.nik_pencatat;

    if (!hasUploadAccess) {
      return res.status(403).json({ message: 'Akses ditolak. Hanya pembuat laporan yang dapat mengupload foto' });
    }

    // validasi semua file
    for (const file of files) {
      try {
        validateImageFile(file.buffer, file.originalname, 5);
      } catch (validationError) {
        return res.status(400).json({ 
          message: `File ${file.originalname}: ${validationError.message}` 
        });
      }
    }

    // cek jumlah foto max 5
    const existingPhotosCount = await BugPhoto.count({ where: { id_bug_report } });
    if (existingPhotosCount + files.length > 5) {
      return res.status(400).json({ 
        message: `Total foto tidak boleh melebihi 5. Saat ini: ${existingPhotosCount}, akan ditambah: ${files.length}` 
      });
    }

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

      if (bug.photo_bug !== 'ada') {
        await bug.update({ photo_bug: 'ada' });
      }

      res.status(201).json({
        message: 'Foto berhasil diupload',
        total_uploaded: uploadedPhotos.length,
        photos: uploadedPhotos
      });
    } catch (uploadError) {
      for (const photo of uploadedPhotos) {
        try {
          await deleteFromSupabase(photo.photo_url);
          await BugPhoto.destroy({ where: { id_bug_photo: photo.id_bug_photo } });
        } catch (rollbackError) {
          console.error('Rollback error:', rollbackError);
        }
      }
      throw uploadError;
    }
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ 
      message: 'Gagal upload foto', 
      error: error.message 
    });
  }
};

// DELETE photo
const deletePhoto = async (req, res) => {
  try {
    const { id_bug_photo } = req.params;
    const photo = await BugPhoto.findByPk(id_bug_photo, { include: [BugReport] });
    if (!photo) {
      return res.status(404).json({ message: 'Foto tidak ditemukan' });
    }

    const user = req.user;
    const bug = photo.BugReport;
    let hasDeleteAccess = false;
    if (isRole(user, 'admin_sa')) hasDeleteAccess = true;
    else if (isRole(user, 'user_umum')) hasDeleteAccess = bug.nik_user === user.nik_user;
    else if (isRole(user, 'pencatat')) hasDeleteAccess = bug.nik_pencatat === user.nik_pencatat;

    if (!hasDeleteAccess) {
      return res.status(403).json({ message: 'Akses ditolak. Hanya pembuat laporan yang dapat menghapus foto' });
    }

    try {
      await deleteFromSupabase(photo.photo_url);
    } catch (supabaseError) {
      console.warn('Supabase delete warning:', supabaseError.message);
    }

    const bugReportId = photo.id_bug_report;
    await photo.destroy();

    const remainingPhotos = await BugPhoto.count({ where: { id_bug_report: bugReportId } });
    if (remainingPhotos === 0) {
      await BugReport.update(
        { photo_bug: 'tidak ada' },
        { where: { id_bug_report: bugReportId } }
      );
    }

    res.json({ 
      message: 'Foto berhasil dihapus',
      remaining_photos: remainingPhotos
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ 
      message: 'Gagal hapus foto', 
      error: error.message 
    });
  }
};

module.exports = {
  getPhotosByBugId,
  uploadPhotos,
  deletePhoto
};
