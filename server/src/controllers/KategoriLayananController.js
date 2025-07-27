const BugCategory = require('../models/bug_category');
const Validator = require('../models/validator');
const BugReport = require('../models/bug_report');

// Ambil semua kategori layanan
const getAllCategories = async (req, res) => {
  try {
    const data = await BugCategory.findAll({
      include: { model: Validator, attributes: ['nip_validator', 'nama'] }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data kategori layanan', error: err.message });
  }
};

// Ambil kategori berdasarkan ID
const getCategoryById = async (req, res) => {
  try {
    const data = await BugCategory.findByPk(req.params.id_kategori, {
      include: { model: Validator, attributes: ['nip_validator', 'nama'] }
    });
    if (!data) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data kategori', error: err.message });
  }
};

// Tambahkan kategori layanan baru
const createCategory = async (req, res) => {
  const { nama_layanan, deskripsi, nip_validator } = req.body;

  try {
    const kategori = await BugCategory.create({ nama_layanan, deskripsi, nip_validator });
    res.status(201).json({ message: 'Kategori layanan berhasil dibuat', kategori });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat kategori layanan', error: err.message });
  }
};

// Perbarui kategori layanan
const updateCategory = async (req, res) => {
  const { id_kategori } = req.params;
  const { nama_layanan, deskripsi, nip_validator } = req.body;

  try {
    const kategori = await BugCategory.findByPk(id_kategori);
    if (!kategori) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    kategori.nama_layanan = nama_layanan || kategori.nama_layanan;
    kategori.deskripsi = deskripsi || kategori.deskripsi;
    kategori.nip_validator = nip_validator || kategori.nip_validator;

    await kategori.save();
    res.json({ message: 'Kategori layanan diperbarui', kategori });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui kategori layanan', error: err.message });
  }
};

// Hapus kategori layanan
const deleteCategory = async (req, res) => {
  const { id_kategori } = req.params;

  try {
    const kategori = await BugCategory.findByPk(id_kategori);
    if (!kategori) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    await kategori.destroy();
    res.json({ message: 'Kategori layanan dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus kategori layanan', error: err.message });
  }
};

// Memperbaiki laporan bug yang salah kategori
const updateLaporanKategori = async (req, res) => {
  const { id_bug_report } = req.params;
  const { id_kategori } = req.body;

  try {
    const bug = await BugReport.findByPk(id_bug_report);
    if (!bug) return res.status(404).json({ message: 'Bug report tidak ditemukan' });

    bug.id_kategori = id_kategori;
    await bug.save();

    res.json({ message: 'Kategori layanan pada bug report berhasil diperbarui', bug });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui kategori bug report', error: err.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateLaporanKategori
};
