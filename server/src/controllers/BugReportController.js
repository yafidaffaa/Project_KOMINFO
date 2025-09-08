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
const { Op } = require('sequelize');

// Helper untuk cek role
const isRole = (user, ...roles) => roles.includes(user.role);

// CREATE
const createBug = async (req, res) => {
  try {
    const { deskripsi, id_bug_category, ket_validator } = req.body;

    if (!isRole(req.user, 'user_umum', 'pencatat', 'admin_sa')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Validasi kategori bug
    const category = await BugCategory.findByPk(id_bug_category);
    if (!category) {
      return res.status(404).json({ message: 'Kategori bug tidak ditemukan' });
    }

    // Buat bug report dengan photo_bug default 'tidak ada'
    const bug = await BugReport.create({
      deskripsi,
      id_bug_category,
      tanggal_laporan: new Date(),
      status: 'diajukan',
      nik_user: req.user.nik_user || null,
      nik_pencatat: req.user.nik_pencatat || null,
      nik_admin_sa: req.user.nik_admin_sa || null,
      photo_bug: 'tidak ada', // Default
      ket_validator: ket_validator || null
    });

    // Handle multiple photos
    const photoFiles = req.files || [];
    if (photoFiles.length > 0) {
      if (photoFiles.length > 5) {
        await bug.destroy(); // Rollback
        return res.status(400).json({ message: 'Maksimal 5 foto diperbolehkan' });
      }

      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const photoUrl = await uploadToSupabase(file.buffer, file.originalname);
        
        await BugPhoto.create({
          id_bug_report: bug.id_bug_report,
          photo_url: photoUrl,
          photo_name: file.originalname,
          urutan: i + 1
        });
      }

      // Update status photo_bug
      await bug.update({ photo_bug: 'ada' });
    }

    // Catat history
    await BugHistory.create({
      id_bug_report: bug.id_bug_report,
      id_akun: req.user.id_akun,
      status: 'diajukan', // sesuai enum BugReport
      keterangan: `Laporan dibuat oleh ${req.user.role}: ${req.user.username}`,
      tanggal: new Date()
    });

    res.status(201).json({ 
      message: 'Laporan bug berhasil dibuat', 
      bug: {
        id_bug_report: bug.id_bug_report,
        deskripsi: bug.deskripsi,
        id_bug_category: bug.id_bug_category,
        tanggal_laporan: bug.tanggal_laporan,
        status: bug.status,
        nik_user: bug.nik_user,
        nik_pencatat: bug.nik_pencatat,
        ket_validator: bug.ket_validator,
        photo_bug: bug.photo_bug // FIXED: ganti has_photo dengan photo_bug langsung
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat laporan bug', error: err.message });
  }
};

// ENHANCED: READ List dengan informasi photo endpoint yang lebih logis
const getBugs = async (req, res) => {
  try {
    let whereClause = {};

    if (isRole(req.user, 'user_umum')) {
      whereClause.nik_user = req.user.nik_user;
    } else if (isRole(req.user, 'pencatat')) {
      whereClause.nik_pencatat = req.user.nik_pencatat;
    } else if (isRole(req.user, 'validator')) {
      const kategori = await BugCategory.findAll({
        where: { nik_validator: req.user.nik_validator }
      });
      const idKategoriList = kategori.map(k => k.id_kategori);
      whereClause.id_bug_category = { [Op.in]: idKategoriList };
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
          attributes: ['nik_user', 'nama']
        },
        {
          model: Pencatat,
          attributes: ['nik_pencatat', 'nama']
        },
        {
          model: AdminSA,
          attributes: ['nik_admin_sa', 'nama']
        }
      ],
      order: [['tanggal_laporan', 'DESC']]
    });

    const transformedBugs = await Promise.all(bugs.map(async (bug) => {
      const bugJson = bug.toJSON();
      const nama_pelapor = bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || null;
      
      // IMPROVED: Photo endpoint hanya ada jika memang ada foto
      let photoInfo = {
        has_photo: bugJson.photo_bug === 'ada',
        photo_count: 0,
        photo_endpoint: null, // Default null
        can_view_photos: false
      };

      // Hanya set endpoint dan hitung foto jika memang ada foto
      if (bugJson.photo_bug === 'ada') {
        const photoCount = await BugPhoto.count({
          where: { id_bug_report: bug.id_bug_report }
        });

        // Hanya set endpoint jika benar-benar ada foto di database
        if (photoCount > 0) {
          photoInfo = {
            has_photo: true,
            photo_count: photoCount,
            photo_endpoint: `/bug-photos/bug-report/${bug.id_bug_report}`,
            can_view_photos: true
          };
        } else {
          // Ada inconsistency: photo_bug = 'ada' tapi tidak ada foto di BugPhoto table
          // Reset photo_bug ke 'tidak ada'
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

    res.json(transformedBugs);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data laporan', error: err.message });
  }
};

// ENHANCED: READ Detail dengan logika photo endpoint yang benar
const getBugById = async (req, res) => {
  try {
    const bug = await BugReport.findByPk(req.params.id, {
      include: [
        {
          model: BugCategory,
          attributes: ['id_kategori', 'nama_layanan']
        },
        { model: UserUmum, attributes: ['nik_user', 'nama'] },
        { model: Pencatat, attributes: ['nik_pencatat', 'nama'] },
        { model: AdminSA, attributes: ['nik_admin_sa', 'nama'] }
      ]
    });

    if (!bug) return res.status(404).json({ message: 'Bug tidak ditemukan' });

    // Authorization checks
    if (isRole(req.user, 'user_umum') && bug.nik_user !== req.user.nik_user) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    if (isRole(req.user, 'pencatat') && bug.nik_pencatat !== req.user.nik_pencatat) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    if (isRole(req.user, 'validator')) {
      const kategori = await BugCategory.findByPk(bug.id_bug_category);
      if (kategori.nik_validator !== req.user.nik_validator) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }

    const bugJson = bug.toJSON();
    const nama_pelapor = bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || null;

    // IMPROVED: Photo info dengan logika yang lebih konsisten
    let photoInfo = {
      has_photo: bugJson.photo_bug === 'ada',
      photo_count: 0,
      photo_endpoint: null, // Default null
      can_view_photos: false,
      can_upload_photos: false,
      can_delete_photos: false,
      upload_endpoint: null // Endpoint khusus untuk upload (via update)
    };

    // Check permission untuk upload/delete foto terlebih dahulu
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
        
        // Hanya bisa delete jika punya permission dan ada foto
        photoInfo.can_delete_photos = canManagePhotos;
      } else {
        // Inconsistency: reset photo_bug
        await bug.update({ photo_bug: 'tidak ada' });
        photoInfo.has_photo = false;
      }
    }

    // Upload permission - bisa upload foto baru via update endpoint jika:
    // 1. Punya permission untuk manage photos
    // 2. Bug masih dalam status yang bisa diedit (tergantung role)
    if (canManagePhotos) {
      let canUpload = false;
      
      if (isRole(user, 'admin_sa')) {
        canUpload = true; // Admin bisa upload kapan saja
      } else if (bugJson.status === 'diajukan') {
        canUpload = true; // User/pencatat bisa upload jika status masih diajukan
      }
      
      if (canUpload) {
        photoInfo.can_upload_photos = true;
        photoInfo.upload_endpoint = `/bug-reports/${bug.id_bug_report}`;
      }
    }

    const response = {
      ...bugJson,
      nama_pelapor,
      photo_info: photoInfo
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail bug', error: err.message });
  }
};

// UPDATE dengan validasi duplikasi BugAssign yang lebih komprehensif
const updateBug = async (req, res) => {
  try {
    // ambil bug report + join nama pelapor
    const bug = await BugReport.findByPk(req.params.id, {
      include: [
        { model: UserUmum, attributes: ['nama'] },
        { model: Pencatat, attributes: ['nama'] },
        { model: AdminSA, attributes: ['nama'] }
      ]
    });
    
    if (!bug) return res.status(404).json({ message: 'Bug tidak ditemukan' });

    let updateData = {};

    if (isRole(req.user, 'admin_sa')) {
      const { deskripsi, id_bug_category, status, ket_validator } = req.body;
      updateData = {
        deskripsi: deskripsi || bug.deskripsi,
        id_bug_category: id_bug_category || bug.id_bug_category,
        status: status || bug.status,
        ket_validator: ket_validator || bug.ket_validator
      };

      // Handle foto untuk admin_sa
      const photoFiles = req.files || [];
      if (photoFiles.length > 0) {
        if (photoFiles.length > 5) {
          return res.status(400).json({ message: 'Maksimal 5 foto diperbolehkan' });
        }

        // Hapus foto lama jika ada
        const existingPhotos = await BugPhoto.findAll({
          where: { id_bug_report: bug.id_bug_report }
        });
        
        for (const photo of existingPhotos) {
          await deleteFromSupabase(photo.photo_url);
          await photo.destroy();
        }

        // Upload foto baru
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          const photoUrl = await uploadToSupabase(file.buffer, file.originalname);
          
          await BugPhoto.create({
            id_bug_report: bug.id_bug_report,
            photo_url: photoUrl,
            photo_name: file.originalname,
            urutan: i + 1
          });
        }

        updateData.photo_bug = 'ada';
      }

    } else if (isRole(req.user, 'admin_kategori')) {
      if (bug.status !== 'revisi_by_admin') {
        return res.status(403).json({ message: 'Bug hanya bisa diupdate ketika status revisi_by_admin' });
      }

      updateData.id_bug_category = req.body.id_bug_category || bug.id_bug_category;
      updateData.status = 'diajukan'; // otomatis jadi diajukan setelah diperbaiki

    } else if (isRole(req.user, 'validator')) {
      if (bug.status === 'revisi_by_admin') {
        return res.status(403).json({ message: 'Bug masih dalam status revisi_by_admin, tunggu admin kategori memperbarui' });
      }
      
      const kategori = await BugCategory.findByPk(bug.id_bug_category);
      if (kategori.nik_validator !== req.user.nik_validator) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
      
      updateData = {
        status: req.body.status || bug.status,
        ket_validator: req.body.ket_validator || bug.ket_validator
      };

      // IMPROVED: Validasi BugAssign untuk semua kasus status 'diproses'
      if (req.body.status === 'diproses') {
        
        // VALIDASI 1: Cek apakah sudah ada BugAssign untuk bug report ini
        const existingAssign = await BugAssign.findOne({
          where: { id_bug_report: bug.id_bug_report }
        });

        if (existingAssign) {
          // Jika status sebelumnya sudah 'diproses' dan mau diubah ke 'diproses' lagi
          if (bug.status === 'diproses') {
            return res.status(409).json({ 
              message: 'Bug report sudah dalam status diproses',
              detail: `Bug assign dengan ID ${existingAssign.id_bug_assign} sudah dibuat sebelumnya. Status tidak dapat diubah ke 'diproses' lagi.`,
              existing_assign_id: existingAssign.id_bug_assign,
              current_status: bug.status,
              requested_status: req.body.status
            });
          } else {
            // Jika status sebelumnya bukan 'diproses' tapi sudah ada BugAssign
            return res.status(409).json({ 
              message: 'Bug assign sudah ada untuk laporan ini',
              detail: `Bug assign dengan ID ${existingAssign.id_bug_assign} sudah dibuat sebelumnya`,
              existing_assign_id: existingAssign.id_bug_assign,
              current_status: bug.status,
              requested_status: req.body.status
            });
          }
        }

        // VALIDASI 2: Ambil teknisi dan pastikan ada
        const teknisis = await Teknisi.findAll({
          where: { nik_validator: req.user.nik_validator }
        });

        if (teknisis.length === 0) {
          return res.status(400).json({ 
            message: 'Tidak ada teknisi untuk validator ini',
            detail: 'Tidak dapat mengubah status ke diproses karena tidak ada teknisi yang terdaftar untuk validator ini'
          });
        }

        // VALIDASI 3: Double check - cek lagi apakah ada yang concurrent create
        const doubleCheckAssign = await BugAssign.findOne({
          where: { id_bug_report: bug.id_bug_report }
        });

        if (doubleCheckAssign) {
          return res.status(409).json({ 
            message: 'Bug assign sudah dibuat oleh proses lain',
            detail: 'Terjadi concurrent creation, silakan refresh dan cek kembali',
            existing_assign_id: doubleCheckAssign.id_bug_assign
          });
        }

        // Jika semua validasi passed, buat BugAssign
        const namaPelapor = bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || null;

        // Buat penugasan untuk setiap teknisi
        const createdAssigns = [];
        for (const t of teknisis) {
          const newAssign = await BugAssign.create({
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
            nik_validator: req.user.nik_validator
          });
          createdAssigns.push(newAssign.id_bug_assign);
        }

        // Log untuk tracking
        console.log(`BugAssign created for bug ${bug.id_bug_report}:`, createdAssigns);
      }

      // ADDITIONAL: Validasi untuk kasus lain jika perlu memberikan info
      else if (bug.status === 'diproses' && req.body.status && req.body.status !== 'diproses') {
        // Jika status sekarang 'diproses' dan mau diubah ke status lain, cek apakah ada BugAssign
        const existingAssign = await BugAssign.findOne({
          where: { id_bug_report: bug.id_bug_report }
        });

        if (existingAssign) {
          // Ini informational saja, tidak block update
          console.log(`Info: Bug report ${bug.id_bug_report} memiliki BugAssign ${existingAssign.id_bug_assign}, status akan diubah dari ${bug.status} ke ${req.body.status}`);
        }
      }

    } else if (isRole(req.user, 'user_umum', 'pencatat')) {
      if (bug.status !== 'diajukan') {
        return res.status(403).json({ message: 'Bug sudah tidak dapat diubah' });
      }
      
      if (isRole(req.user, 'user_umum') && bug.nik_user !== req.user.nik_user) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
      if (isRole(req.user, 'pencatat') && bug.nik_pencatat !== req.user.nik_pencatat) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }

      updateData.deskripsi = req.body.deskripsi || bug.deskripsi;
      
      // Handle foto untuk user_umum/pencatat
      const photoFiles = req.files || [];
      if (photoFiles.length > 0) {
        if (photoFiles.length > 5) {
          return res.status(400).json({ message: 'Maksimal 5 foto diperbolehkan' });
        }

        // Hapus foto lama jika ada
        const existingPhotos = await BugPhoto.findAll({
          where: { id_bug_report: bug.id_bug_report }
        });
        
        for (const photo of existingPhotos) {
          await deleteFromSupabase(photo.photo_url);
          await photo.destroy();
        }

        // Upload foto baru
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          const photoUrl = await uploadToSupabase(file.buffer, file.originalname);
          
          await BugPhoto.create({
            id_bug_report: bug.id_bug_report,
            photo_url: photoUrl,
            photo_name: file.originalname,
            urutan: i + 1
          });
        }

        updateData.photo_bug = 'ada';
      }

    } else {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    await bug.update(updateData);

    // Catat history
    await BugHistory.create({
      id_bug_report: bug.id_bug_report,
      id_akun: req.user.id_akun,
      status: updateData.status || bug.status,
      keterangan: `Bug diperbarui oleh ${req.user.role}: ${req.user.username}`,
      tanggal: new Date()
    });

    const response = {
      ...bug.toJSON(),
      ...updateData
    };

    res.json({ message: 'Bug diperbarui', bug: response });
  } catch (err) {
    console.error('Error updating bug:', err);
    res.status(500).json({ message: 'Gagal memperbarui bug', error: err.message });
  }
};

// DELETE
const deleteBug = async (req, res) => {
  try {
    if (!isRole(req.user, 'admin_sa')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const bug = await BugReport.findByPk(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug tidak ditemukan' });

    // FIXED: Hapus foto dari Firebase dan BugPhoto table dulu
    const photos = await BugPhoto.findAll({
      where: { id_bug_report: bug.id_bug_report }
    });
    
    for (const photo of photos) {
      await deleteFromSupabase(photo.photo_url);
      await photo.destroy();
    }

    // Hapus history terkait
    await BugHistory.destroy({ where: { id_bug_report: bug.id_bug_report } });

    // Hapus bug assign jika ada
    await BugAssign.destroy({ where: { id_bug_report: bug.id_bug_report } });

    // Baru hapus bug utama
    await bug.destroy();

    res.json({ message: 'Bug dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus bug', error: err.message });
  }
};

// Statistik
const getBugStatistics = async (req, res) => {
  try {
    const { tahun } = req.query;
    if (!tahun) {
      return res.status(400).json({ message: 'Parameter tahun wajib diisi ?tahun=YYYY' });
    }

    // filter tahun
    let whereClause = {
      tanggal_laporan: {
        [Op.between]: [new Date(`${tahun}-01-01`), new Date(`${tahun}-12-31`)]
      }
    };

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
      const idKategoriList = kategori.map(k => k.id_kategori);
      whereClause.id_bug_category = { [Op.in]: idKategoriList };
    } else if (!isRole(req.user, 'admin_sa')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Hitung semua statistik
    const total = await BugReport.count({ where: whereClause });
    const diajukan = await BugReport.count({ where: { ...whereClause, status: 'diajukan' } });
    const diproses = await BugReport.count({ where: { ...whereClause, status: 'diproses' } });
    const selesai = await BugReport.count({ where: { ...whereClause, status: 'selesai' } });
    const pendapat_selesai = await BugReport.count({ where: { ...whereClause, status: 'pendapat_selesai' } });

    res.json({
      tahun,
      total,
      diajukan,
      diproses,
      selesai,
      pendapat_selesai
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil statistik bug', error: err.message });
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