const BugCategory = require('../models/bug_category');
const Validator = require('../models/validator');
const BugReport = require('../models/bug_report');
const { Op } = require('sequelize');

// Mendapatkan semua kategori layanan
const getAllCategories = async (req, res) => {
  try {
    const categories = await BugCategory.findAll({
      include: { 
        model: Validator, 
        as: 'validator', 
        attributes: ['nik_validator', 'nama', 'nip_validator', 'email', 'no_hp'] 
      }
    });

    if (categories.length === 0) {
      return res.status(200).json({ message: 'Belum ada data kategori layanan', data: [] });
    }

    res.status(200).json({ 
      message: 'Data kategori layanan berhasil diambil',
      total: categories.length,
      data: categories 
    });
  } catch (error) {
    console.error('Error get all categories:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kategori layanan', error: error.message });
  }
};

// Mendapatkan kategori berdasarkan ID
const getCategoryById = async (req, res) => {
  const { id_kategori } = req.params;

  // Validasi ID kategori
  if (!id_kategori || isNaN(id_kategori)) {
    return res.status(400).json({ message: 'ID kategori harus berupa angka' });
  }

  try {
    const category = await BugCategory.findByPk(id_kategori, {
      include: { 
        model: Validator, 
        as: 'validator', 
        attributes: ['nik_validator', 'nama', 'nip_validator', 'email', 'no_hp'] 
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Kategori layanan tidak ditemukan' });
    }

    res.status(200).json({ 
      message: 'Data kategori layanan berhasil diambil',
      data: category 
    });
  } catch (error) {
    console.error('Error get category by id:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kategori layanan', error: error.message });
  }
};

// Membuat kategori layanan baru
const createCategory = async (req, res) => {
  const { nama_layanan, deskripsi, nik_validator } = req.body;

  // Validasi field wajib
  if (!nama_layanan || !nik_validator) {
    return res.status(400).json({ message: 'Nama layanan dan NIK validator wajib diisi' });
  }

  // Validasi format NIK validator
  if (nik_validator.length !== 16 || !/^\d+$/.test(nik_validator)) {
    return res.status(400).json({ message: 'NIK validator harus terdiri dari 16 digit angka' });
  }

  // Validasi panjang nama layanan
  if (nama_layanan.length > 100) {
    return res.status(400).json({ message: 'Nama layanan maksimal 100 karakter' });
  }

  try {
    // Cek apakah validator exists
    const validator = await Validator.findByPk(nik_validator);
    if (!validator) {
      return res.status(404).json({ message: 'Validator dengan NIK tersebut tidak ditemukan' });
    }

    // Cek apakah validator sudah ditetapkan ke kategori lain
    const existingCategory = await BugCategory.findOne({ where: { nik_validator } });
    if (existingCategory) {
      return res.status(409).json({ message: 'Validator ini sudah ditetapkan ke kategori lain' });
    }

    // Cek apakah nama layanan sudah ada
    const existingName = await BugCategory.findOne({ 
      where: { nama_layanan: { [Op.like]: nama_layanan } } 
    });
    if (existingName) {
      return res.status(409).json({ message: 'Nama layanan sudah digunakan' });
    }

    // Buat kategori baru
    const kategori = await BugCategory.create({ 
      nama_layanan, 
      deskripsi, 
      nik_validator 
    });

    // Ambil data lengkap dengan relasi
    const newCategory = await BugCategory.findByPk(kategori.id_kategori, {
      include: { 
        model: Validator, 
        as: 'validator', 
        attributes: ['nik_validator', 'nama', 'nip_validator'] 
      }
    });

    res.status(201).json({ 
      message: 'Kategori layanan berhasil dibuat dan validator ditetapkan', 
      data: newCategory 
    });
  } catch (error) {
    console.error('Error create category:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat kategori layanan', error: error.message });
  }
};

// Mengupdate kategori layanan
const updateCategory = async (req, res) => {
  const { id_kategori } = req.params;
  const { nama_layanan, deskripsi, nik_validator } = req.body;

  // Validasi ID kategori
  if (!id_kategori || isNaN(id_kategori)) {
    return res.status(400).json({ message: 'ID kategori harus berupa angka' });
  }

  try {
    const kategori = await BugCategory.findByPk(id_kategori);

    if (!kategori) {
      return res.status(404).json({ message: 'Kategori layanan tidak ditemukan' });
    }

    // Cek apakah ada data yang akan diupdate
    if (!nama_layanan && deskripsi === undefined && !nik_validator) {
      return res.status(400).json({ message: 'Tidak ada data yang akan diperbarui' });
    }

    // Validasi nama layanan jika diupdate
    if (nama_layanan) {
      if (nama_layanan.length > 100) {
        return res.status(400).json({ message: 'Nama layanan maksimal 100 karakter' });
      }
      // Cek apakah nama layanan sudah digunakan kategori lain
      const existingName = await BugCategory.findOne({ 
        where: { 
          nama_layanan: { [Op.like]: nama_layanan },
          id_kategori: { [Op.ne]: id_kategori } 
        } 
      });
      if (existingName) {
        return res.status(409).json({ message: 'Nama layanan sudah digunakan' });
      }
    }

    // Validasi validator jika diupdate
    if (nik_validator) {
      // Validasi format NIK validator
      if (nik_validator.length !== 16 || !/^\d+$/.test(nik_validator)) {
        return res.status(400).json({ message: 'NIK validator harus terdiri dari 16 digit angka' });
      }

      // Cek apakah validator exists
      const validator = await Validator.findByPk(nik_validator);
      if (!validator) {
        return res.status(404).json({ message: 'Validator dengan NIK tersebut tidak ditemukan' });
      }

      // Cek apakah validator sudah ditetapkan ke kategori lain
      const existingCategory = await BugCategory.findOne({
        where: { 
          nik_validator, 
          id_kategori: { [Op.ne]: id_kategori } 
        }
      });
      if (existingCategory) {
        return res.status(409).json({ message: 'Validator ini sudah ditetapkan ke kategori lain' });
      }
    }

    // Update data
    const updateData = {};
    if (nama_layanan) updateData.nama_layanan = nama_layanan;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (nik_validator) updateData.nik_validator = nik_validator;

    await kategori.update(updateData);

    // Ambil data yang sudah diupdate dengan relasi
    const updatedCategory = await BugCategory.findByPk(id_kategori, {
      include: { 
        model: Validator, 
        as: 'validator', 
        attributes: ['nik_validator', 'nama', 'nip_validator'] 
      }
    });

    res.status(200).json({ 
      message: 'Kategori layanan berhasil diperbarui', 
      data: updatedCategory 
    });
  } catch (error) {
    console.error('Error update category:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui kategori layanan', error: error.message });
  }
};

// Menghapus kategori layanan
const deleteCategory = async (req, res) => {
  const { id_kategori } = req.params;

  // Validasi ID kategori
  if (!id_kategori || isNaN(id_kategori)) {
    return res.status(400).json({ message: 'ID kategori harus berupa angka' });
  }

  try {
    const kategori = await BugCategory.findByPk(id_kategori);

    if (!kategori) {
      return res.status(404).json({ message: 'Kategori layanan tidak ditemukan' });
    }

    // Cek apakah masih ada bug report yang terkait dengan kategori ini
    const relatedReports = await BugReport.count({ where: { id_kategori } });
    if (relatedReports > 0) {
      return res.status(409).json({ 
        message: `Tidak dapat menghapus kategori. Masih ada ${relatedReports} laporan bug yang terkait dengan kategori ini` 
      });
    }

    await kategori.destroy();

    res.status(200).json({ message: 'Kategori layanan berhasil dihapus' });
  } catch (error) {
    console.error('Error delete category:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus kategori layanan', error: error.message });
  }
};

// Revisi laporan bug oleh admin kategori
const revisiBugReport = async (req, res) => {
  const { id_laporan } = req.params;
  const { catatan_revisi } = req.body;

  // Validasi ID laporan
  if (!id_laporan || isNaN(id_laporan)) {
    return res.status(400).json({ message: 'ID laporan harus berupa angka' });
  }

  // Validasi catatan revisi
  if (!catatan_revisi || catatan_revisi.trim() === '') {
    return res.status(400).json({ message: 'Catatan revisi wajib diisi' });
  }

  try {
    const laporan = await BugReport.findByPk(id_laporan);

    if (!laporan) {
      return res.status(404).json({ message: 'Laporan bug tidak ditemukan' });
    }

    // Cek apakah status laporan memungkinkan untuk direvisi
    if (laporan.status === 'selesai') {
      return res.status(400).json({ message: 'Laporan bug yang sudah selesai tidak dapat direvisi' });
    }

    // Update laporan
    laporan.catatan_revisi = catatan_revisi;
    laporan.status = 'revisi';
    await laporan.save();

    res.status(200).json({ 
      message: 'Revisi laporan bug berhasil disimpan', 
      data: laporan 
    });
  } catch (error) {
    console.error('Error revisi bug report:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat merevisi laporan bug', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  revisiBugReport
};