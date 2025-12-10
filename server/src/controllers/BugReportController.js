const BugReport = require('../models/bug_report');
const BugCategory = require('../models/bug_category');
const BugHistory = require('../models/bug_history');
const BugPhoto = require('../models/bug_photo');
const Teknisi = require('../models/teknisi');
const UserUmum = require('../models/user_umum');
const Pencatat = require('../models/pencatat');
const AdminSA = require('../models/admin_sa');
const BugAssign = require('../models/bug_assign');
const { uploadToSupabase, deleteFromSupabase } = require('../utils/supabaseUpload');
const { generateKeterangan } = require('../utils/bugHistoryHelper');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Helper untuk cek role
const isRole = (user, ...roles) => roles.includes(user.role);

// Membuat laporan bug baru
const createBug = async (req, res) => {
  const { deskripsi, id_bug_category, ket_validator } = req.body;

  // Validasi role
  if (!isRole(req.user, 'user_umum', 'pencatat', 'admin_sa')) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  // Validasi field wajib
  if (!deskripsi || !id_bug_category) {
    return res.status(400).json({ message: 'Deskripsi dan kategori bug wajib diisi' });
  }

  // Validasi panjang deskripsi
  if (deskripsi.trim().length < 10) {
    return res.status(400).json({ message: 'Deskripsi minimal 10 karakter' });
  }

  const transaction = await sequelize.transaction();

  try {
    // Validasi kategori bug
    const category = await BugCategory.findByPk(id_bug_category);
    if (!category) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Kategori bug tidak ditemukan' });
    }

    // Validasi foto (jika ada)
    const photoFiles = req.files || [];
    if (photoFiles.length > 5) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Maksimal 5 foto diperbolehkan' });
    }

    const createdBy = req.user.nama || req.user.nama_lengkap || 'Unknown';

    // Buat bug report dengan photo_bug default 'tidak ada'
    const bug = await BugReport.create({
      deskripsi: deskripsi.trim(),
      id_bug_category,
      tanggal_laporan: new Date(),
      status: 'diajukan',
      nik_user: req.user.nik_user || null,
      nik_pencatat: req.user.nik_pencatat || null,
      nik_admin_sa: req.user.nik_admin_sa || null,
      photo_bug: 'tidak ada',
      ket_validator: ket_validator?.trim() || null,
      created_by: createdBy
    }, { transaction });

    // Handle multiple photos
    if (photoFiles.length > 0) {
      const uploadedPhotos = [];

      try {
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];

          // Validasi tipe file
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`File ${file.originalname} bukan format gambar yang valid`);
          }

          // Validasi ukuran file (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`File ${file.originalname} melebihi ukuran maksimal 5MB`);
          }

          const photoUrl = await uploadToSupabase(file.buffer, file.originalname);
          uploadedPhotos.push(photoUrl);

          await BugPhoto.create({
            id_bug_report: bug.id_bug_report,
            photo_url: photoUrl,
            photo_name: file.originalname,
            urutan: i + 1
          }, { transaction });
        }

        // Update status photo_bug
        await bug.update({ photo_bug: 'ada' }, { transaction });
      } catch (uploadError) {
        // Rollback uploaded photos jika ada error
        for (const photoUrl of uploadedPhotos) {
          await deleteFromSupabase(photoUrl);
        }
        throw uploadError;
      }
    }

    // Catat history
    await BugHistory.create({
      id_bug_report: bug.id_bug_report,
      id_akun: req.user.id_akun,
      status: 'diajukan',
      keterangan: generateKeterangan('diajukan', req.user),
      tanggal: new Date()
    }, { transaction });

    await transaction.commit();

    // Ambil data lengkap dengan relasi
    const newBug = await BugReport.findByPk(bug.id_bug_report, {
      include: [
        {
          model: BugCategory,
          attributes: ['id_kategori', 'nama_layanan']
        }
      ]
    });

    res.status(201).json({
      message: 'Laporan bug berhasil dibuat',
      data: newBug
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error create bug report:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat membuat laporan bug',
      error: error.message
    });
  }
};

// Mengambil semua laporan bug
const getBugs = async (req, res) => {
  try {
    let whereClause = {};

    // Filter berdasarkan role
    if (isRole(req.user, 'user_umum')) {
      whereClause.nik_user = req.user.nik_user;
    } else if (isRole(req.user, 'pencatat')) {
      whereClause.nik_pencatat = req.user.nik_pencatat;
    } else if (isRole(req.user, 'validator')) {
      const kategori = await BugCategory.findAll({
        where: { nik_validator: req.user.nik_validator },
        attributes: ['id_kategori']
      });

      if (kategori.length === 0) {
        return res.status(200).json({
          message: 'Belum ada kategori yang ditangani',
          data: []
        });
      }

      const idKategoriList = kategori.map(k => k.id_kategori);
      whereClause.id_bug_category = { [Op.in]: idKategoriList };
    } else if (!isRole(req.user, 'admin_sa', 'admin_kategori')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const bugs = await BugReport.findAll({
      where: whereClause,
      include: [
        {
          model: BugCategory,
          attributes: ['id_kategori', 'nama_layanan']
        },
        {
          model: UserUmum,
          attributes: ['nik_user', 'nama'],
          required: false
        },
        {
          model: Pencatat,
          attributes: ['nik_pencatat', 'nama'],
          required: false
        },
        {
          model: AdminSA,
          attributes: ['nik_admin_sa', 'nama'],
          required: false
        }
      ],
      order: [['tanggal_laporan', 'DESC']]
    });

    if (bugs.length === 0) {
      return res.status(200).json({
        message: 'Belum ada laporan bug',
        data: []
      });
    }

    // Transform data dengan photo info
    const transformedBugs = await Promise.all(bugs.map(async (bug) => {
      const bugJson = bug.toJSON();
      const nama_pelapor = bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || 'Tidak Diketahui';

      let photoInfo = {
        has_photo: bugJson.photo_bug === 'ada',
        photo_count: 0,
        photo_endpoint: null,
        can_view_photos: false
      };

      // Jika ada foto, ambil detail foto
      if (bugJson.photo_bug === 'ada') {
        const photoCount = await BugPhoto.count({
          where: { id_bug_report: bug.id_bug_report }
        });

        if (photoCount > 0) {
          photoInfo = {
            has_photo: true,
            photo_count: photoCount,
            photo_endpoint: `/bug-photos/bug-report/${bug.id_bug_report}`,
            can_view_photos: true
          };
        } else {
          // Inconsistency: reset photo_bug ke 'tidak ada'
          await bug.update({ photo_bug: 'tidak ada' });
          photoInfo.has_photo = false;
        }
      }

      return {
        ...bugJson,
        nama_pelapor,
        photo_info: photoInfo
      };
    }));

    res.status(200).json({
      message: 'Data laporan bug berhasil diambil',
      total: transformedBugs.length,
      data: transformedBugs
    });
  } catch (error) {
    console.error('Error get all bug reports:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data laporan bug',
      error: error.message
    });
  }
};

// Mengambil detail laporan bug berdasarkan ID
const getBugById = async (req, res) => {
  const { id } = req.params;

  // Validasi ID
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID bug report tidak valid' });
  }

  try {
    const bug = await BugReport.findByPk(id, {
      include: [
        {
          model: BugCategory,
          attributes: ['id_kategori', 'nama_layanan']
        },
        {
          model: UserUmum,
          attributes: ['nik_user', 'nama'],
          required: false
        },
        {
          model: Pencatat,
          attributes: ['nik_pencatat', 'nama'],
          required: false
        },
        {
          model: AdminSA,
          attributes: ['nik_admin_sa', 'nama'],
          required: false
        }
      ]
    });

    if (!bug) {
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

    // Authorization checks
    if (isRole(req.user, 'user_umum') && bug.nik_user !== req.user.nik_user) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    if (isRole(req.user, 'pencatat') && bug.nik_pencatat !== req.user.nik_pencatat) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    if (isRole(req.user, 'validator')) {
      const kategori = await BugCategory.findByPk(bug.id_bug_category);
      if (!kategori || kategori.nik_validator !== req.user.nik_validator) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }

    const bugJson = bug.toJSON();
    const nama_pelapor = bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || 'Tidak Diketahui';

    // Photo info dengan permission
    let photoInfo = {
      has_photo: bugJson.photo_bug === 'ada',
      photo_count: 0,
      photo_endpoint: null,
      can_view_photos: false,
      can_upload_photos: false,
      can_delete_photos: false,
      upload_endpoint: null
    };

    // Check permission untuk manage photos
    const user = req.user;
    let canManagePhotos = false;

    if (isRole(user, 'admin_sa')) {
      canManagePhotos = true;
    } else if (isRole(user, 'user_umum') && bug.nik_user === user.nik_user) {
      canManagePhotos = true;
    } else if (isRole(user, 'pencatat') && bug.nik_pencatat === user.nik_pencatat) {
      canManagePhotos = true;
    }

    // Jika ada foto, set viewing info
    if (bugJson.photo_bug === 'ada') {
      const photoCount = await BugPhoto.count({
        where: { id_bug_report: bug.id_bug_report }
      });

      if (photoCount > 0) {
        photoInfo.photo_count = photoCount;
        photoInfo.photo_endpoint = `/bug-photos/bug-report/${bug.id_bug_report}`;
        photoInfo.can_view_photos = true;
        photoInfo.can_delete_photos = canManagePhotos;
      } else {
        // Inconsistency: reset photo_bug
        await bug.update({ photo_bug: 'tidak ada' });
        photoInfo.has_photo = false;
      }
    }

    // Upload permission
    if (canManagePhotos) {
      let canUpload = false;

      if (isRole(user, 'admin_sa')) {
        canUpload = true;
      } else if (bugJson.status === 'diajukan') {
        canUpload = true;
      }

      if (canUpload) {
        photoInfo.can_upload_photos = true;
        photoInfo.upload_endpoint = `/bug-photos/bug-report/${bug.id_bug_report}`;
      }
    }

    res.status(200).json({
      message: 'Detail bug report berhasil diambil',
      data: {
        ...bugJson,
        nama_pelapor,
        photo_info: photoInfo
      }
    });
  } catch (error) {
    console.error('Error get bug report by id:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil detail bug report',
      error: error.message
    });
  }
};

// Memperbarui laporan bug
const updateBug = async (req, res) => {
  const { id } = req.params;

  // Validasi ID
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID bug report tidak valid' });
  }

  const transaction = await sequelize.transaction();

  try {
    const bug = await BugReport.findByPk(id, {
      include: [
        { model: UserUmum, attributes: ['nama'] },
        { model: Pencatat, attributes: ['nama'] },
        { model: AdminSA, attributes: ['nama'] }
      ],
      transaction
    });

    if (!bug) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

    let updateData = {};
    let statusChanged = false;

    const updatedBy = req.user.nama || req.user.nama_lengkap || 'Unknown';

    // ADMIN SA - Full control
    if (isRole(req.user, 'admin_sa')) {
      const { deskripsi, id_bug_category, status, ket_validator } = req.body;

      // Validasi kategori jika diubah
      if (id_bug_category && id_bug_category !== bug.id_bug_category) {
        const category = await BugCategory.findByPk(id_bug_category);
        if (!category) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Kategori bug tidak ditemukan' });
        }
      }

      // Validasi status jika diubah
      if (status) {
        const validStatus = ['diajukan', 'diproses', 'revisi_by_admin', 'selesai', 'pendapat_selesai'];
        if (!validStatus.includes(status)) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Status tidak valid',
            valid_status: validStatus
          });
        }
        statusChanged = status !== bug.status;
      }

      updateData = {
        deskripsi: deskripsi?.trim() || bug.deskripsi,
        id_bug_category: id_bug_category || bug.id_bug_category,
        status: status || bug.status,
        ket_validator: ket_validator?.trim() || bug.ket_validator,
        updated_by: updatedBy
      };

      // Handle foto untuk admin_sa
      const photoFiles = req.files || [];
      if (photoFiles.length > 0) {
        if (photoFiles.length > 5) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Maksimal 5 foto diperbolehkan' });
        }

        // Hapus foto lama
        const existingPhotos = await BugPhoto.findAll({
          where: { id_bug_report: bug.id_bug_report },
          transaction
        });

        for (const photo of existingPhotos) {
          await deleteFromSupabase(photo.photo_url);
          await photo.destroy({ transaction });
        }

        // Upload foto baru
        const uploadedPhotos = [];
        try {
          for (let i = 0; i < photoFiles.length; i++) {
            const file = photoFiles[i];

            // Validasi tipe file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.mimetype)) {
              throw new Error(`File ${file.originalname} bukan format gambar yang valid`);
            }

            // Validasi ukuran file
            if (file.size > 5 * 1024 * 1024) {
              throw new Error(`File ${file.originalname} melebihi ukuran maksimal 5MB`);
            }

            const photoUrl = await uploadToSupabase(file.buffer, file.originalname);
            uploadedPhotos.push(photoUrl);

            await BugPhoto.create({
              id_bug_report: bug.id_bug_report,
              photo_url: photoUrl,
              photo_name: file.originalname,
              urutan: i + 1
            }, { transaction });
          }
          updateData.photo_bug = 'ada';
        } catch (uploadError) {
          // Rollback uploaded photos
          for (const photoUrl of uploadedPhotos) {
            await deleteFromSupabase(photoUrl);
          }
          throw uploadError;
        }
      }

    }
    // ADMIN KATEGORI
    else if (isRole(req.user, 'admin_kategori')) {
      if (bug.status !== 'revisi_by_admin') {
        await transaction.rollback();
        return res.status(403).json({
          message: 'Bug hanya bisa diupdate ketika status revisi_by_admin'
        });
      }

      const { id_bug_category } = req.body;

      if (id_bug_category) {
        const category = await BugCategory.findByPk(id_bug_category);
        if (!category) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Kategori bug tidak ditemukan' });
        }
      }

      updateData.id_bug_category = id_bug_category || bug.id_bug_category;
      updateData.status = 'diajukan';
      updateData.updated_by = updatedBy;
      statusChanged = true;

    }
    // VALIDATOR
    else if (isRole(req.user, 'validator')) {
      if (bug.status === 'revisi_by_admin') {
        await transaction.rollback();
        return res.status(403).json({
          message: 'Bug masih dalam status revisi_by_admin, tunggu admin kategori memperbarui'
        });
      }

      const kategori = await BugCategory.findByPk(bug.id_bug_category);
      if (!kategori || kategori.nik_validator !== req.user.nik_validator) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Akses ditolak' });
      }

      const { status, ket_validator } = req.body;

      // Validasi status
      if (status) {
        const validStatus = ['diajukan', 'diproses', 'revisi_by_admin', 'selesai', 'pendapat_selesai'];
        if (!validStatus.includes(status)) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Status tidak valid',
            valid_status: validStatus
          });
        }
        statusChanged = status !== bug.status;
      }

      updateData = {
        status: status || bug.status,
        ket_validator: ket_validator?.trim() || bug.ket_validator,
        updated_by: updatedBy
      };

      // Validasi dan create BugAssign untuk status 'diproses'
      if (status === 'diproses') {
        // Cek apakah sudah ada BugAssign
        const existingAssign = await BugAssign.findOne({
          where: { id_bug_report: bug.id_bug_report },
          transaction
        });

        if (existingAssign) {
          await transaction.rollback();

          if (bug.status === 'diproses') {
            return res.status(409).json({
              message: 'Bug report sudah dalam status diproses',
              detail: `Bug assign dengan ID ${existingAssign.id_bug_assign} sudah dibuat sebelumnya`,
              existing_assign_id: existingAssign.id_bug_assign
            });
          } else {
            return res.status(409).json({
              message: 'Bug assign sudah ada untuk laporan ini',
              detail: `Bug assign dengan ID ${existingAssign.id_bug_assign} sudah dibuat sebelumnya`,
              existing_assign_id: existingAssign.id_bug_assign
            });
          }
        }

        // Ambil teknisi
        const teknisis = await Teknisi.findAll({
          where: { nik_validator: req.user.nik_validator },
          transaction
        });

        if (teknisis.length === 0) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Tidak ada teknisi untuk validator ini',
            detail: 'Tidak dapat mengubah status ke diproses karena tidak ada teknisi yang terdaftar'
          });
        }

        // Buat BugAssign
        const namaPelapor = bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || 'Tidak Diketahui';
        const createdBy = req.user.nama || req.user.nama_lengkap || 'Unknown';

        for (const t of teknisis) {
          await BugAssign.create({
            id_bug_category: bug.id_bug_category,
            deskripsi: bug.deskripsi,
            photo_bug: bug.photo_bug,
            tanggal_penugasan: new Date(),
            status: 'diproses',
            id_bug_report: bug.id_bug_report,
            nama_pelapor: namaPelapor,
            ket_validator: null,
            validasi_validator: null,
            catatan_teknisi: null,
            nik_teknisi: t.nik_teknisi,
            nik_validator: req.user.nik_validator,
            created_by: createdBy,
            updated_by: createdBy
          }, { transaction });
        }
      }

    }
    // USER UMUM / PENCATAT
    else if (isRole(req.user, 'user_umum', 'pencatat')) {
      if (bug.status !== 'diajukan') {
        await transaction.rollback();
        return res.status(403).json({ message: 'Bug sudah tidak dapat diubah' });
      }

      // Authorization check
      if (isRole(req.user, 'user_umum') && bug.nik_user !== req.user.nik_user) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Akses ditolak' });
      }
      if (isRole(req.user, 'pencatat') && bug.nik_pencatat !== req.user.nik_pencatat) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Akses ditolak' });
      }

      const { deskripsi } = req.body;

      // Validasi deskripsi
      if (deskripsi && deskripsi.trim().length < 10) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Deskripsi minimal 10 karakter' });
      }

      updateData.deskripsi = deskripsi?.trim() || bug.deskripsi;
      updateData.updated_by = updatedBy;

      // Handle foto
      const photoFiles = req.files || [];
      if (photoFiles.length > 0) {
        if (photoFiles.length > 5) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Maksimal 5 foto diperbolehkan' });
        }

        // Hapus foto lama
        const existingPhotos = await BugPhoto.findAll({
          where: { id_bug_report: bug.id_bug_report },
          transaction
        });

        for (const photo of existingPhotos) {
          await deleteFromSupabase(photo.photo_url);
          await photo.destroy({ transaction });
        }

        // Upload foto baru
        const uploadedPhotos = [];
        try {
          for (let i = 0; i < photoFiles.length; i++) {
            const file = photoFiles[i];

            // Validasi tipe file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.mimetype)) {
              throw new Error(`File ${file.originalname} bukan format gambar yang valid`);
            }

            // Validasi ukuran file
            if (file.size > 5 * 1024 * 1024) {
              throw new Error(`File ${file.originalname} melebihi ukuran maksimal 5MB`);
            }

            const photoUrl = await uploadToSupabase(file.buffer, file.originalname);
            uploadedPhotos.push(photoUrl);

            await BugPhoto.create({
              id_bug_report: bug.id_bug_report,
              photo_url: photoUrl,
              photo_name: file.originalname,
              urutan: i + 1
            }, { transaction });
          }
          updateData.photo_bug = 'ada';
        } catch (uploadError) {
          // Rollback uploaded photos
          for (const photoUrl of uploadedPhotos) {
            await deleteFromSupabase(photoUrl);
          }
          throw uploadError;
        }
      }

    } else {
      await transaction.rollback();
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Cek apakah ada perubahan
    const hasChanges = Object.keys(updateData).some(
      key => updateData[key] !== bug[key]
    );

    if (!hasChanges) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Tidak ada data yang diperbarui' });
    }

    // Update bug report
    await bug.update(updateData, { transaction });

    const newStatus = updateData.status || bug.status;

    // Catat history jika status berubah
    if (statusChanged) {
      await BugHistory.create({
        id_bug_report: bug.id_bug_report,
        id_akun: req.user.id_akun,
        status: newStatus,
        keterangan: generateKeterangan(newStatus, req.user),
        tanggal: new Date()
      }, { transaction });
    }

    await transaction.commit();

    // Ambil data lengkap
    const updatedBug = await BugReport.findByPk(bug.id_bug_report, {
      include: [
        {
          model: BugCategory,
          attributes: ['id_kategori', 'nama_layanan']
        }
      ]
    });

    res.status(200).json({
      message: 'Bug report berhasil diperbarui',
      data: updatedBug
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error update bug report:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui bug report',
      error: error.message
    });
  }
};

// Menghapus laporan bug
const deleteBug = async (req, res) => {
  const { id } = req.params;

  // Validasi role
  if (!isRole(req.user, 'admin_sa')) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  // Validasi ID
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID bug report tidak valid' });
  }

  const transaction = await sequelize.transaction();

  try {
    const bug = await BugReport.findByPk(id, { transaction });

    if (!bug) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

    // Hapus foto dari storage dan database
    const photos = await BugPhoto.findAll({
      where: { id_bug_report: bug.id_bug_report },
      transaction
    });

    for (const photo of photos) {
      await deleteFromSupabase(photo.photo_url);
      await photo.destroy({ transaction });
    }

    // Hapus history terkait
    await BugHistory.destroy({
      where: { id_bug_report: bug.id_bug_report },
      transaction
    });

    // Hapus bug assign jika ada
    await BugAssign.destroy({
      where: { id_bug_report: bug.id_bug_report },
      transaction
    });

    // Hapus bug report
    await bug.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({ message: 'Bug report berhasil dihapus' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error delete bug report:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menghapus bug report',
      error: error.message
    });
  }
};

// Mengambil statistik bug report
const getBugStatistics = async (req, res) => {
  let { tahun } = req.query;

  // Validasi tahun
  if (tahun && (isNaN(tahun) || tahun < 2000 || tahun > 2100)) {
    return res.status(400).json({ message: 'Tahun tidak valid' });
  }
  if (!tahun) {
    tahun = new Date().getFullYear();
  }
  try {
    // Range tanggal dengan UTC
    const startDate = new Date(`${tahun}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${tahun}-12-31T23:59:59.999Z`);

    // Filter dasar
    const whereCondition = {
      tanggal_laporan: {
        [Op.between]: [startDate, endDate],
      },
    };

    // Filter sesuai role
    if (isRole(req.user, 'user_umum')) {
      whereCondition.nik_user = req.user.nik_user;
    } else if (isRole(req.user, 'pencatat')) {
      whereCondition.nik_pencatat = req.user.nik_pencatat;
    } else if (isRole(req.user, 'validator')) {
      const kategori = await BugCategory.findAll({
        where: { nik_validator: req.user.nik_validator },
        attributes: ['id_kategori']
      });

      if (kategori.length === 0) {
        return res.status(200).json({
          message: 'Belum ada kategori yang ditangani',
          tahun: parseInt(tahun),
          total: 0,
          diajukan: 0,
          diproses: 0,
          selesai: 0,
          pendapat_selesai: 0
        });
      }

      const idKategoriList = kategori.map(k => k.id_kategori);
      whereCondition.id_bug_category = { [Op.in]: idKategoriList };
    } else if (!isRole(req.user, 'admin_sa', 'admin_kategori')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Hitung statistik
    const [total, diajukan, diproses, selesai, pendapatSelesai] = await Promise.all([
      BugReport.count({ where: whereCondition }),
      BugReport.count({ where: { ...whereCondition, status: 'diajukan' } }),
      BugReport.count({ where: { ...whereCondition, status: 'diproses' } }),
      BugReport.count({ where: { ...whereCondition, status: 'selesai' } }),
      BugReport.count({ where: { ...whereCondition, status: 'pendapat_selesai' } })
    ]);

    res.status(200).json({
      message: 'Statistik bug report berhasil diambil',
      data: {
        tahun: parseInt(tahun),
        total,
        diajukan,
        diproses,
        selesai,
        pendapat_selesai: pendapatSelesai
      }
    });

  } catch (error) {
    console.error('Error get bug statistics:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil statistik bug report',
      error: error.message
    });
  }
};
module.exports = {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
  getBugStatistics
};