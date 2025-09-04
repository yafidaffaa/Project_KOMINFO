const BugAssign = require('../models/bug_assign');
const BugReport = require('../models/bug_report');
const BugCategory = require('../models/bug_category');
const Teknisi = require('../models/teknisi');
const Validator = require('../models/validator');
const BugHistory = require('../models/bug_history');
const { Op } = require("sequelize");

// Helper cek role
const isRole = (user, ...roles) => roles.includes(user.role);

// GET ALL sesuai role
const getAllAssign = async (req, res) => {
  try {
    let whereClause = {};

    if (isRole(req.user, 'validator')) {
      whereClause.nik_validator = req.user.nik_validator;
    } else if (isRole(req.user, 'teknisi')) {
      whereClause.nik_teknisi = req.user.nik_teknisi;
    }
    // admin_sa bisa lihat semua

    const assigns = await BugAssign.findAll({
      where: whereClause,
      attributes: { exclude: ['photo_bug'] },
      include: [
        { model: BugReport, attributes: ['id_bug_report', 'deskripsi', 'tanggal_laporan', 'status'] },
        { model: BugCategory, attributes: ['id_kategori', 'nama_layanan'] },
        { model: Teknisi, attributes: ['nik_teknisi', 'nama'] },
        { model: Validator, attributes: ['nik_validator', 'nama'] }
      ],
      order: [['tanggal_penugasan', 'DESC']]
    });

    const response = assigns.map(a => ({
      ...a.toJSON(),
      has_photo: !!a.getDataValue('photo_bug')
    }));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data bug assign', error: err.message });
  }
};

// GET DETAIL sesuai role
const getDetailAssign = async (req, res) => {
  try {
    const { id_bug_assign } = req.params;
    let whereClause = { id_bug_assign };

    if (isRole(req.user, 'validator')) {
      whereClause.nik_validator = req.user.nik_validator;
    } else if (isRole(req.user, 'teknisi')) {
      whereClause.nik_teknisi = req.user.nik_teknisi;
    }
    // admin_sa bisa lihat semua

    const assign = await BugAssign.findOne({
      where: whereClause,
      include: [
        { model: BugReport, attributes: ['id_bug_report', 'deskripsi', 'tanggal_laporan', 'status', 'nik_user', 'nik_pencatat'] },
        { model: BugCategory, attributes: ['id_kategori', 'nama_layanan'] },
        { model: Teknisi, attributes: ['nik_teknisi', 'nama', 'email'] },
        { model: Validator, attributes: ['nik_validator', 'nama', 'email'] }
      ]
    });

    if (!assign) return res.status(404).json({ message: 'Bug assign tidak ditemukan' });

    res.json({
      ...assign.toJSON(),
      photo_bug: assign.photo_bug ? assign.photo_bug.toString('base64') : null
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
        return res.status(403).json({ message: 'Data bukan milik Andaaaaaa' });
      }
      const { catatan_teknisi, status } = req.body;
      if (catatan_teknisi !== undefined) updateData.catatan_teknisi = catatan_teknisi;
      if (status !== undefined) updateData.status = status;

      await BugHistory.create({
        id_bug_report: assign.id_bug_report,
        id_akun: req.user.id_akun,
        status: `${status || 'update catatan'}`,
        keterangan: `Bug diperbarui oleh ${req.user.role}: ${req.user.username}`,
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
        status: `${validasi_validator || 'update ket.'}`,
        keterangan: `Bug diperbarui oleh ${req.user.role}: ${req.user.username}`,
        tanggal: new Date()
      });

    } else if (isRole(req.user, 'admin_sa')) {
      // admin bisa update semua field bebas
      updateData = req.body;

      await BugHistory.create({
        id_bug_report: assign.id_bug_report,
        id_akun: req.user.id_akun,
        status: 'Admin_sa melakukan update bug assign',
        keterangan: `Bug diperbarui oleh ${req.user.role}: ${req.user.username}`,
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

    await BugReport.update(
      { status: 'diajukan' },
      { where: { id_bug_report: assign.id_bug_report } }
    );

    await BugHistory.destroy({
  where: { id_bug_report: assign.id_bug_report }
});


    await assign.destroy();

    await BugHistory.create({
      id_bug_report: assign.id_bug_report,
      id_akun: req.user.id_akun,
      status: 'Bug assign dihapus admin_sa',
      tanggal: new Date()
    });

    res.json({ message: 'Bug assign berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus bug assign', error: err.message });
  }
};

const getStatistikAssign = async (req, res) => {
  try {
    let { tahun } = req.query;
    if (!tahun) {
      tahun = new Date().getFullYear(); // default tahun berjalan
    }

    // Range awal & akhir tahun
    const startDate = new Date(`${tahun}-01-01 00:00:00`);
    const endDate = new Date(`${tahun}-12-31 23:59:59`);

    // Filter dasar
    const whereCondition = {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };

    // Filter sesuai role
    if (req.user.role === "teknisi") {
      whereCondition.nik_teknisi = req.user.nik_teknisi;
    } else if (req.user.role === "validator") {
      whereCondition.nik_validator = req.user.nik_validator;
    }

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
      tahun,
      total,
      diproses,
      selesai,
      pendapat_selesai: pendapatSelesai,
    });
  } catch (error) {
    console.error(error);
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
