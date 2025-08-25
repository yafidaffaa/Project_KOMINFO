const BugReport = require('../models/bug_report');
const BugCategory = require('../models/bug_category');
const BugHistory = require('../models/bug_history');
// const BugPhoto = require('../models/bug_photo'); // aktifkan kalau tabel ada
const Teknisi = require('../models/teknisi');
const BugAssign = require('../models/bug_assign');
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

    // Handle foto utama (BLOB)
    let photoBugBuffer = null;
    const photoFile = req.file || req.files?.photo_bug;
    if (photoFile) {
      photoBugBuffer = photoFile.buffer || require('fs').readFileSync(photoFile.path);
    }

    const bug = await BugReport.create({
      deskripsi,
      id_bug_category,
      tanggal_laporan: new Date(),
      status: 'diajukan',
      nik_user: req.user.nik_user || null,
      nik_pencatat: req.user.nik_pencatat || null,
      photo_bug: photoBugBuffer,
      ket_validator: ket_validator || null
    });

    // Simpan foto tambahan (jika pakai tabel BugPhoto)
    const additionalPhotos = req.files?.photos || [];
    if (additionalPhotos.length > 5) {
      return res.status(400).json({ message: 'Maksimal 5 foto tambahan diperbolehkan' });
    }

    for (const photo of additionalPhotos) {
      await BugPhoto.create({
        id_bug_report: bug.id_bug_report,
        file_path: photo.path
      });
    }

    // Catat history → ubah `aksi` jadi `status` supaya sesuai model
    await BugHistory.create({
      id_bug_report: bug.id_bug_report,
      id_akun: req.user.id_akun,
      status: 'diajukan', // sesuai enum BugReport
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
        has_photo: !!bug.photo_bug
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
      attributes: { exclude: ['photo_bug'] },
      include: [
        {
          model: BugCategory,
          attributes: ['id_kategori', 'nama_layanan']
        }
      ],
      order: [['tanggal_laporan', 'DESC']]
    });

    const transformedBugs = bugs.map(bug => ({
      ...bug.toJSON(),
      has_photo: !!bug.getDataValue('photo_bug')
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
        }
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
      photo_bug: bug.photo_bug ? bug.photo_bug.toString('base64') : null
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail bug', error: err.message });
  }
};

// UPDATE
const updateBug = async (req, res) => {
  try {
    const bug = await BugReport.findByPk(req.params.id);
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

      const photoFile = req.file || req.files?.photo_bug;
      if (photoFile) {
        updateData.photo_bug = photoFile.buffer || require('fs').readFileSync(photoFile.path);
      }
    } else if (isRole(req.user, 'admin_kategori')) {
  if (bug.status !== 'revisi_by_admin') {
    return res.status(403).json({ message: 'Bug hanya bisa diupdate ketika status revisi_by_admin' });
  }

  updateData.id_bug_category = req.body.id_bug_category || bug.id_bug_category;
  updateData.status = 'diajukan'; // otomatis jadi diajukan setelah diperbaiki
}
else if (isRole(req.user, 'validator')) {
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

  // buat penugasan untuk setiap teknisi
  for (const t of teknisis) {
    await BugAssign.create({
      id_bug_category: bug.id_bug_category,
      deskripsi: bug.deskripsi,
      photo_bug: bug.photo_bug,
      tanggal_penugasan: new Date(),
      status: 'diproses',
      id_bug_report: bug.id_bug_report,
      ket_validator: null,
      validasi_validator: null,
      catatan_teknisi: null,
      nik_teknisi: t.nik_teknisi, // otomatis ambil dari data teknisi
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
      const photoFile = req.file || req.files?.photo_bug;
      if (photoFile) {
        updateData.photo_bug = photoFile.buffer || require('fs').readFileSync(photoFile.path);
      }
    } else {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    await bug.update(updateData);

    // Catat history pakai `status` bukan `aksi`
    await BugHistory.create({
      id_bug_report: bug.id_bug_report,
      id_akun: req.user.id_akun,
      status: bug.status,
      tanggal: new Date()
    });

    const response = {
      ...bug.toJSON(),
      photo_bug: undefined,
      has_photo: !!bug.photo_bug
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

    // Hapus history terkait dulu
    await BugHistory.destroy({ where: { id_bug_report: bug.id_bug_report } });

    // Baru hapus bug utama
    await bug.destroy();


    res.json({ message: 'Bug dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus bug', error: err.message });
  }
};


module.exports = {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug
};
