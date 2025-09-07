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

// READ List
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
      // FIXED: tidak perlu exclude photo_bug karena sekarang hanya string
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

    const transformedBugs = bugs.map(bug => ({
      ...bug.toJSON(),
      // FIXED: photo_bug sudah ada di response, tidak perlu transform has_photo
      nama_pelapor: bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || null
    }));

    res.json(transformedBugs);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data laporan', error: err.message });
  }
};

// READ Detail
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

    const response = {
      ...bug.toJSON(),
      nama_pelapor: bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || null
      // FIXED: hapus konversi base64, photo_bug sudah string biasa
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail bug', error: err.message });
  }
};

// UPDATE
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

      // FIXED: Handle foto untuk admin_sa - upload ke Firebase dan BugPhoto table
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

      // Kalau status diubah ke diproses → insert ke BugAssign
      if (req.body.status === 'diproses' && bug.status !== 'diproses') {
        // ambil semua teknisi yang punya nik_validator sama dengan validator ini
        const teknisis = await Teknisi.findAll({
          where: { nik_validator: req.user.nik_validator }
        });

        if (teknisis.length === 0) {
          return res.status(400).json({ message: 'Tidak ada teknisi untuk validator ini' });
        }

        // tentukan nama pelapor
        let namaPelapor =
          bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || null;

        // buat penugasan untuk setiap teknisi
        for (const t of teknisis) {
          await BugAssign.create({
            id_bug_category: bug.id_bug_category,
            deskripsi: bug.deskripsi,
            photo_bug: bug.photo_bug, // FIXED: ini sudah string 'ada'/'tidak ada'
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
      
      // FIXED: Handle foto untuk user_umum/pencatat - upload ke Firebase dan BugPhoto table
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
      status: bug.status,
      keterangan: `Bug diperbarui oleh ${req.user.role}: ${req.user.username}`,
      tanggal: new Date()
    });

    const response = {
      ...bug.toJSON(),
      // FIXED: tidak perlu manipulasi photo_bug, sudah langsung string
    };

    res.json({ message: 'Bug diperbarui', bug: response });
  } catch (err) {
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