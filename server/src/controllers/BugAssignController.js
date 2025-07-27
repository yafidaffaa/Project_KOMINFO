const BugAssign = require('../models/bug_assign');
const BugReport = require('../models/bug_report');
const Validator = require('../models/validator');
const Teknisi = require('../models/teknisi');
const BugCategory = require('../models/bug_category');
const BugHistory = require('../models/bug_history');

// 1. Validator → Assign bug ke teknisi (dipanggil otomatis saat status diubah ke "diproses")
const createAssign = async (req, res) => {
  const { id_bug_report, nip_teknisi } = req.body;
  const { id_akun } = req.user;

  try {
    const bug = await BugReport.findByPk(id_bug_report, {
      include: BugCategory
    });
    if (!bug) return res.status(404).json({ message: 'Bug report tidak ditemukan' });

    const validator = bug.bug_category?.nip_validator;
    if (!validator) return res.status(400).json({ message: 'Validator tidak ditemukan dari kategori' });

    const teknisi = await Teknisi.findOne({
      where: {
        nip_teknisi,
        nip_validator: validator // teknisi hanya bisa milik validator yang sama
      }
    });
    if (!teknisi) return res.status(404).json({ message: 'Teknisi tidak sesuai atau tidak ditemukan' });

    const assign = await BugAssign.create({
      id_bug_report,
      nip_validator: validator,
      nip_teknisi,
      status: 'diproses',
      modul_perbaikan: null,
      validasi_validator: null
    });

    bug.status = 'diproses';
    await bug.save();

    await BugHistory.create({
      id_bug_report,
      id_akun,
      aksi: `Validator meng-assign bug ke teknisi (${nip_teknisi})`,
      tanggal: new Date()
    });

    res.status(201).json({ message: 'Bug berhasil di-assign ke teknisi', assign });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal meng-assign bug' });
  }
};

// 2. Teknisi → Lihat semua bug assign miliknya (hanya dari validator yang sama)
const getAllForTeknisi = async (req, res) => {
  const { nik_teknisi, nik_validator } = req.user;

  try {
    const bugAssigns = await BugAssign.findAll({
      where: {
        nip_teknisi: nik_teknisi,
        nip_validator: nik_validator
      },
      include: [BugReport]
    });
    res.json(bugAssigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data' });
  }
};

// 3. Teknisi → Lihat detail assign
const getDetailAssignByTeknisi = async (req, res) => {
  const { id_assign } = req.params;
  const { nik_teknisi, nik_validator } = req.user;

  try {
    const assign = await BugAssign.findOne({
      where: {
        id_assign,
        nip_teknisi: nik_teknisi,
        nip_validator: nik_validator
      },
      include: [BugReport]
    });

    if (!assign) return res.status(404).json({ message: 'Assign tidak ditemukan atau bukan milik Anda' });
    res.json(assign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil detail assign' });
  }
};

// 4. Teknisi → Update status & modul
const updateByTeknisi = async (req, res) => {
  const { id_assign } = req.params;
  const { status, modul_perbaikan } = req.body;

  try {
    const assign = await BugAssign.findByPk(id_assign);
    if (!assign) return res.status(404).json({ message: 'Data tidak ditemukan' });

    assign.status = status;
    assign.modul_perbaikan = modul_perbaikan;
    await assign.save();

    await BugHistory.create({
      id_bug_report: assign.id_bug_report,
      id_akun: req.user.id_akun,
      aksi: `Teknisi memperbarui status: ${status}`,
      tanggal: new Date()
    });

    res.json({ message: 'Berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal update data' });
  }
};

// 5. Validator → Validasi hasil teknisi
const validasiByValidator = async (req, res) => {
  const { id_assign } = req.params;
  const { validasi_validator } = req.body;

  try {
    const assign = await BugAssign.findByPk(id_assign);
    if (!assign) return res.status(404).json({ message: 'Data tidak ditemukan' });

    assign.validasi_validator = validasi_validator;
    await assign.save();

    if (validasi_validator === 'disetujui') {
      const bug = await BugReport.findByPk(assign.id_bug_report);
      if (bug) {
        bug.status = assign.status;
        await bug.save();
      }

      await BugHistory.create({
        id_bug_report: assign.id_bug_report,
        id_akun: req.user.id_akun,
        aksi: `Validator menyetujui hasil perbaikan. Status: ${assign.status}`,
        tanggal: new Date()
      });
    }

    res.json({ message: 'Validasi berhasil' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal validasi' });
  }
};

// 6. Validator → Melihat semua assign miliknya
const getAllForValidator = async (req, res) => {
  const { nik_validator } = req.user;

  try {
    const bugAssigns = await BugAssign.findAll({
      where: { nip_validator: nik_validator },
      include: [BugReport, Teknisi]
    });
    res.json(bugAssigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil bug assign' });
  }
};

module.exports = {
  createAssign,
  getAllForTeknisi,
  getDetailAssignByTeknisi,
  updateByTeknisi,
  validasiByValidator,
  getAllForValidator
};
