const BugAssign = require('../models/bug_assign');
const BugReport = require('../models/bug_report');
const BugCategory = require('../models/bug_category');
const Teknisi = require('../models/teknisi');
const Validator = require('../models/validator');
const BugHistory = require('../models/bug_history');
const BugPhoto = require('../models/bug_photo');
// ADD MISSING IMPORTS
const UserUmum = require('../models/user_umum');
const Pencatat = require('../models/pencatat');
const AdminSA = require('../models/admin_sa');
const { Op } = require("sequelize");

// Helper cek role
const isRole = (user, ...roles) => roles.includes(user.role);

// ENHANCED: GET ALL sesuai role dengan photo_info konsisten
const getAllAssign = async (req, res) => {
  try {
    let whereClause = {};

    if (isRole(req.user, 'validator')) {
      whereClause.nik_validator = req.user.nik_validator;
    } else if (isRole(req.user, 'teknisi')) {
      whereClause.nik_teknisi = req.user.nik_teknisi;
    }

    const assigns = await BugAssign.findAll({
      where: whereClause,
      include: [
        { 
          model: BugReport,
          attributes: ['id_bug_report', 'deskripsi', 'tanggal_laporan', 'status', 'photo_bug', 'nik_user', 'nik_pencatat', 'nik_admin_sa'],
          include: [
            { model: UserUmum, attributes: ['nama'] },
            { model: Pencatat, attributes: ['nama'] },
            { model: AdminSA, attributes: ['nama'] }
          ]
        },
        { model: BugCategory, attributes: ['id_kategori', 'nama_layanan'] },
        { model: Teknisi, attributes: ['nik_teknisi', 'nama'] },
        { model: Validator, attributes: ['nik_validator', 'nama'] }
      ],
      order: [['tanggal_penugasan', 'DESC']]
    });

    const response = await Promise.all(assigns.map(async (assign) => {
      const bug = assign.BugReport;
      const namaPelapor = bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || null;
      
      // ENHANCED: Konsisten dengan format photo_info seperti di Bug Report
      let photoInfo = {
        has_photo: bug.photo_bug === 'ada',
        photo_count: 0,
        photo_endpoint: `/api/bug-photos/${bug.id_bug_report}`,
        can_view_photos: false
      };

      if (bug.photo_bug === 'ada') {
        const photoCount = await BugPhoto.count({
          where: { id_bug_report: bug.id_bug_report }
        });

        photoInfo.photo_count = photoCount;
        photoInfo.can_view_photos = true;
      }

      return { 
        ...assign.toJSON(), 
        nama_pelapor: namaPelapor,
        photo_info: photoInfo
      };
    }));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data bug assign', error: err.message });
  }
};


// ENHANCED: GET DETAIL sesuai role dengan photo_info konsisten
const getDetailAssign = async (req, res) => {
  try {
    const { id_bug_assign } = req.params;
    let whereClause = { id_bug_assign };

    if (isRole(req.user, 'validator')) {
      whereClause.nik_validator = req.user.nik_validator;
    } else if (isRole(req.user, 'teknisi')) {
      whereClause.nik_teknisi = req.user.nik_teknisi;
    }

    const assign = await BugAssign.findOne({
      where: whereClause,
      include: [
        { 
          model: BugReport,
          attributes: ['id_bug_report', 'deskripsi', 'tanggal_laporan', 'status', 'photo_bug', 'nik_user', 'nik_pencatat', 'nik_admin_sa'],
          include: [
            { model: UserUmum, attributes: ['nama'] },
            { model: Pencatat, attributes: ['nama'] },
            { model: AdminSA, attributes: ['nama'] }
          ]
        },
        { model: BugCategory, attributes: ['id_kategori', 'nama_layanan'] },
        { model: Teknisi, attributes: ['nik_teknisi', 'nama', 'email'] },
        { model: Validator, attributes: ['nik_validator', 'nama', 'email'] }
      ]
    });

    if (!assign) return res.status(404).json({ message: 'Bug assign tidak ditemukan' });

    const bug = assign.BugReport;
    const namaPelapor = bug.UserUmum?.nama || bug.Pencatat?.nama || bug.AdminSA?.nama || null;

    // IMPROVED: Photo endpoint hanya ada jika memang ada foto
    let photoInfo = {
      has_photo: bug.photo_bug === 'ada',
      photo_count: 0,
      photo_endpoint: null,
      can_view_photos: false
    };

    // Hanya set endpoint jika memang ada foto
    if (bug.photo_bug === 'ada') {
      const photoCount = await BugPhoto.count({
        where: { id_bug_report: bug.id_bug_report }
      });

      // Hanya set endpoint jika benar-benar ada foto di database
      if (photoCount > 0) {
        photoInfo.photo_count = photoCount;
        photoInfo.photo_endpoint = `/bug-photos/bug-report/${bug.id_bug_report}`;
        photoInfo.can_view_photos = true;
      }
    }

    res.json({ 
      ...assign.toJSON(), 
      nama_pelapor: namaPelapor,
      photo_info: photoInfo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil detail bug assign', error: err.message });
  }
};


// UPDATE sesuai role
const updateAssign = async (req, res) => {
  try {
    const { id_bug_assign } = req.params;
    const assign = await BugAssign.findByPk(id_bug_assign);
    if (!assign) return res.status(404).json({ message: 'Bug assign tidak ditemukan' });

    let updateData = {};

    if (isRole(req.user, 'teknisi')) {
      // hanya milik teknisi
      if (assign.nik_teknisi !== req.user.nik_teknisi) {
        return res.status(403).json({ message: 'Data bukan milik Anda' });
      }
      const { catatan_teknisi, status } = req.body;
      if (catatan_teknisi !== undefined) updateData.catatan_teknisi = catatan_teknisi;
      if (status !== undefined) updateData.status = status;

      await BugHistory.create({
        id_bug_report: assign.id_bug_report,
        id_akun: req.user.id_akun,
        status: `${status}`,
        keterangan: `Bug assign diperbarui oleh ${req.user.role}: ${req.user.username}`,
        tanggal: new Date()
      });

    } else if (isRole(req.user, 'validator')) {
      if (assign.nik_validator !== req.user.nik_validator) {
        return res.status(403).json({ message: 'Data bukan milik Anda' });
      }
      const { ket_validator, validasi_validator } = req.body;
      if (ket_validator !== undefined) updateData.ket_validator = ket_validator;
      if (validasi_validator !== undefined) {
        updateData.validasi_validator = validasi_validator;

        if (validasi_validator === 'disetujui') {
          await BugReport.update(
            { status: assign.status },
            { where: { id_bug_report: assign.id_bug_report } }
          );
        } else if (validasi_validator === 'tidak_disetujui') {
          updateData.status = 'diproses'; // kembalikan status BugAssign ke diproses

          await BugReport.update(
            { status: 'diproses' },
            { where: { id_bug_report: assign.id_bug_report } }
          );
        }
      }

      await BugHistory.create({
        id_bug_report: assign.id_bug_report,
        id_akun: req.user.id_akun,
        status: `${validasi_validator}`,
        keterangan: `Bug assign diperbarui oleh ${req.user.role}: ${req.user.username}`,
        tanggal: new Date()
      });

    } else if (isRole(req.user, 'admin_sa')) {
      // admin bisa update semua field bebas
      updateData = req.body;

      await BugHistory.create({
        id_bug_report: assign.id_bug_report,
        id_akun: req.user.id_akun,
        status: 'Admin_sa melakukan update bug assign',
        keterangan: `Bug assign diperbarui oleh ${req.user.role}: ${req.user.username}`,
        tanggal: new Date()
      });
    } else {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    await assign.update(updateData);

    res.json({ message: 'Update bug assign berhasil', assign });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal update bug assign', error: err.message });
  }
};

// DELETE hanya admin_sa
const deleteAssign = async (req, res) => {
  try {
    const { id_bug_assign } = req.params;
    if (!isRole(req.user, 'admin_sa')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const assign = await BugAssign.findByPk(id_bug_assign);
    if (!assign) return res.status(404).json({ message: 'Bug assign tidak ditemukan' });

    // Update status BugReport kembali ke diajukan
    await BugReport.update(
      { status: 'diajukan' },
      { where: { id_bug_report: assign.id_bug_report } }
    );

    // Hapus history terkait bug assign
    await BugHistory.destroy({
      where: { 
        id_bug_report: assign.id_bug_report,
        keterangan: { [Op.like]: '%bug assign%' } // hanya hapus history yang terkait bug assign
      }
    });

    await assign.destroy();

    await BugHistory.create({
      id_bug_report: assign.id_bug_report,
      id_akun: req.user.id_akun,
      status: 'Bug assign dihapus admin_sa',
      keterangan: `Bug assign dihapus oleh ${req.user.role}: ${req.user.username}`,
      tanggal: new Date()
    });

    res.json({ message: 'Bug assign berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus bug assign', error: err.message });
  }
};

// FIXED: getStatistikAssign dengan timezone yang benar  
const getStatistikAssign = async (req, res) => {
  try {
    let { tahun } = req.query;
    if (!tahun) {
      tahun = new Date().getFullYear(); // default tahun berjalan
    }

    // FIXED: Range dengan UTC explicit untuk menghindari timezone shift
    const startDate = new Date(`${tahun}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${tahun}-12-31T23:59:59.999Z`);

    // Filter dasar
    const whereCondition = {
      tanggal_penugasan: {
        [Op.between]: [startDate, endDate],
      },
    };

    // Filter sesuai role
    if (isRole(req.user, 'teknisi')) {
      whereCondition.nik_teknisi = req.user.nik_teknisi;
    } else if (isRole(req.user, 'validator')) {
      whereCondition.nik_validator = req.user.nik_validator;
    } else if (!isRole(req.user, 'admin_sa')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    console.log('📊 Bug Assign Where condition:', whereCondition);
    console.log('🎯 Date range (UTC):', { startDate, endDate });

    // Hitung jumlah
    const total = await BugAssign.count({ where: whereCondition });
    const diproses = await BugAssign.count({
      where: { ...whereCondition, status: "diproses" },
    });
    const selesai = await BugAssign.count({
      where: { ...whereCondition, status: "selesai" },
    });
    const pendapatSelesai = await BugAssign.count({
      where: { ...whereCondition, status: "pendapat_selesai" },
    });

    return res.json({
      tahun: parseInt(tahun),
      total,
      diproses,
      selesai,
      pendapat_selesai: pendapatSelesai,
    });
  } catch (error) {
    console.error('❌ Error in getStatistikAssign:', error);
    return res.status(500).json({
      message: "Gagal mengambil statistik bug assign",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAssign,
  getDetailAssign,
  updateAssign,
  deleteAssign,
  getStatistikAssign
};