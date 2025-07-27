const BugReport = require('../models/bug_report');
const BugCategory = require('../models/bug_category');
const BugHistory = require('../models/bug_history');
const { Op } = require('sequelize');

// 1. Buat laporan bug (oleh user atau pencatat)
const createBug = async (req, res) => {
  try {
    const { judul, deskripsi, id_kategori } = req.body;

    const bug = await BugReport.create({
      judul,
      deskripsi,
      id_kategori,
      tanggal_lapor: new Date(),
      status: 'diajukan',
      nik_user: req.user.nik_user || null,
      nip_pencatat: req.user.nip_pencatat || null
    });

    await BugHistory.create({
      id_bug_report: bug.id_bug_report,
      id_akun: req.user.id_akun,
      aksi: 'Membuat laporan bug',
      tanggal: new Date()
    });

    res.status(201).json({ message: 'Laporan bug berhasil dibuat', bug });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat laporan bug', error: err.message });
  }
};

// 2. Lihat daftar bug yang dilaporkan oleh user/pencatat
const getBugsByUser = async (req, res) => {
  try {
    const filter = req.user.nik_user
      ? { nik_user: req.user.nik_user }
      : { nip_pencatat: req.user.nip_pencatat };

    const bugs = await BugReport.findAll({
      where: filter,
      include: BugCategory,
      order: [['tanggal_lapor', 'DESC']]
    });

    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data laporan', error: err.message });
  }
};

// 3. Detail laporan bug berdasarkan ID
const getBugById = async (req, res) => {
  try {
    const bug = await BugReport.findByPk(req.params.id, {
      include: BugCategory
    });

    if (!bug) return res.status(404).json({ message: 'Bug tidak ditemukan' });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail bug', error: err.message });
  }
};

// 4. Validator mengubah status laporan bug
// 4. Validator mengubah status laporan bug
const updateStatus = async (req, res) => {
  const { status, catatan_validator, nip_teknisi } = req.body;

  try {
    const bug = await BugReport.findByPk(req.params.id, {
      include: BugCategory
    });
    if (!bug) return res.status(404).json({ message: 'Bug tidak ditemukan' });

    // Simpan perubahan status
    bug.status = status;
    if (catatan_validator) bug.catatan_validator = catatan_validator;
    await bug.save();

    // Catat riwayat perubahan
    await BugHistory.create({
      id_bug_report: bug.id_bug_report,
      id_akun: req.user.id_akun,
      aksi: `Validator mengubah status menjadi: ${status}`,
      tanggal: new Date()
    });

    // Jika status menjadi 'diproses', buat entri ke BugAssign
    if (status === 'diproses') {
      const nip_validator = bug.bug_category?.nip_validator;
      if (!nip_validator) return res.status(400).json({ message: 'Kategori tidak memiliki validator' });

      if (!nip_teknisi) {
        return res.status(400).json({ message: 'nip_teknisi harus disediakan untuk proses assign' });
      }

      const teknisi = await Teknisi.findOne({
        where: {
          nip_teknisi,
          nip_validator // Pastikan teknisi dari validator yang sama
        }
      });

      if (!teknisi) {
        return res.status(400).json({ message: 'Teknisi tidak valid atau bukan milik validator ini' });
      }

      const existingAssign = await BugAssign.findOne({
        where: { id_bug_report: bug.id_bug_report }
      });

      if (!existingAssign) {
        await BugAssign.create({
          id_bug_report: bug.id_bug_report,
          nip_validator,
          nip_teknisi,
          status: 'diproses',
          modul_perbaikan: null,
          validasi_validator: null
        });

        await BugHistory.create({
          id_bug_report: bug.id_bug_report,
          id_akun: req.user.id_akun,
          aksi: `Validator meng-assign bug ke teknisi (${nip_teknisi})`,
          tanggal: new Date()
        });
      }
    }

    res.json({ message: 'Status bug berhasil diperbarui', bug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui status', error: err.message });
  }
};


// 5. Validator melihat bug dari kategori (layanan) yang ia tangani
const getBugsByValidatorKategori = async (req, res) => {
  try {
    const nip_validator = req.user.nip;

    // Cari kategori yang dipegang validator ini
    const kategori = await BugCategory.findAll({
      where: { nip_validator }
    });

    const idKategoriList = kategori.map(k => k.id_kategori);

    const bugs = await BugReport.findAll({
      where: {
        id_kategori: { [Op.in]: idKategoriList },
        status: { [Op.notIn]: ['selesai', 'dianggap selesai'] }
      },
      include: BugCategory,
      order: [['tanggal_lapor', 'DESC']]
    });

    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil laporan untuk validator', error: err.message });
  }
};

module.exports = {
  createBug,
  getBugsByUser,
  getBugById,
  updateStatus,
  getBugsByValidatorKategori
};
