const BugCategory = require('../models/bug_category');
const Validator = require('../models/validator');
const BugReport = require('../models/bug_report');

// 1. Menambahkan layanan baru
const createLayanan = async (req, res) => {
  const { nama_layanan, nip_validator } = req.body;

  try {
    // Validasi validator harus ada
    const validator = await Validator.findOne({ where: { nip_validator } });
    if (!validator) {
      return res.status(400).json({ message: 'Validator tidak ditemukan' });
    }

    const layanan = await BugCategory.create({
      nama_layanan,
      nip_validator
    });

    res.status(201).json({ message: 'Layanan berhasil ditambahkan', layanan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan layanan' });
  }
};

// 2. Menampilkan semua layanan
const getAllLayanan = async (req, res) => {
  try {
    const layanan = await BugCategory.findAll({ include: Validator });
    res.json(layanan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data layanan' });
  }
};

// 3. Menampilkan layanan berdasarkan ID
const getLayananById = async (req, res) => {
  try {
    const layanan = await BugCategory.findOne({
      where: { id_kategori: req.params.id },
      include: Validator
    });

    if (!layanan) return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    res.json(layanan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data layanan' });
  }
};

// 4. Memperbarui layanan (nama_layanan & nip_validator)
const updateLayanan = async (req, res) => {
  const { nama_layanan, nip_validator } = req.body;

  try {
    const layanan = await BugCategory.findOne({ where: { id_kategori: req.params.id } });

    if (!layanan) return res.status(404).json({ message: 'Layanan tidak ditemukan' });

    // Validasi validator jika dikirim
    if (nip_validator) {
      const validator = await Validator.findOne({ where: { nip_validator } });
      if (!validator) {
        return res.status(400).json({ message: 'Validator tidak ditemukan' });
      }
      layanan.nip_validator = nip_validator;
    }

    if (nama_layanan) layanan.nama_layanan = nama_layanan;

    await layanan.save();
    res.json({ message: 'Layanan berhasil diperbarui', layanan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui layanan' });
  }
};

// 5. Menghapus layanan
const deleteLayanan = async (req, res) => {
  try {
    const layanan = await BugCategory.findOne({ where: { id_kategori: req.params.id } });

    if (!layanan) return res.status(404).json({ message: 'Layanan tidak ditemukan' });

    await layanan.destroy();
    res.json({ message: 'Layanan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus layanan' });
  }
};

// 6. Revisi bug report → ubah kategori layanan jika status = "Revisi by admin"
const revisiLayanan = async (req, res) => {
  const { id_kategori_baru } = req.body;

  try {
    const bug = await BugReport.findOne({ where: { id_bug_report: req.params.id } });

    if (!bug) return res.status(404).json({ message: 'Bug report tidak ditemukan' });

    if (bug.status !== 'Revisi by admin') {
      return res.status(403).json({ message: 'Bug report ini tidak dalam status "Revisi by admin"' });
    }

    // Validasi layanan baru
    const kategoriBaru = await BugCategory.findByPk(id_kategori_baru);
    if (!kategoriBaru) {
      return res.status(400).json({ message: 'Kategori layanan baru tidak ditemukan' });
    }

    bug.id_kategori = id_kategori_baru;
    await bug.save();

    res.json({ message: 'Layanan pada bug report berhasil diperbaiki', bug });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbaiki bug report' });
  }
};

module.exports = {
  createLayanan,
  getAllLayanan,
  getLayananById,
  updateLayanan,
  deleteLayanan,
  revisiLayanan
};
