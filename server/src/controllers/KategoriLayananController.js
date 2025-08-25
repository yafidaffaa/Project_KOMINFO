// controllers/bug_category_controller.js
const BugCategory = require('../models/bug_category');
const Validator = require('../models/validator'); // Validator = teknisi yang bertanggung jawab
const BugReport = require('../models/bug_report');

// Ambil semua kategori layanan beserta validator
const getAllCategories = async (req, res) => {
  try {
    const data = await BugCategory.findAll({
      include: { model: Validator, as: 'validator', attributes: ['nik_validator', 'nama'] }
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
      include: { model: Validator, as: 'validator', attributes: ['nik_validator', 'nama'] }
    });
    if (!data) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data kategori', error: err.message });
  }
};

// Tambahkan kategori layanan baru + validasi validator
// const createCategory = async (req, res) => {
//   const { nama_layanan, deskripsi, nik_validator } = req.body;

//   if (!nama_layanan || !nik_validator) {
//     return res.status(400).json({ message: 'Nama layanan dan nik_validator wajib diisi' });
//   }

//   try {
//     // Pastikan validator ada
//     const validator = await Validator.findByPk(nik_validator);
//     if (!validator) {
//       return res.status(404).json({ message: 'Validator tidak ditemukan' });
//     }

//     const kategori = await BugCategory.create({ nama_layanan, deskripsi, nik_validator });
//     res.status(201).json({ message: 'Kategori layanan berhasil dibuat dan validator ditetapkan', kategori });
//   } catch (err) {
//     res.status(500).json({ message: 'Gagal membuat kategori layanan', error: err.message });
//   }
// };

// // Perbarui kategori layanan + validasi perubahan validator
// const updateCategory = async (req, res) => {
//   const { id_kategori } = req.params;
//   const { nama_layanan, deskripsi, nik_validator } = req.body;

//   try {
//     const kategori = await BugCategory.findByPk(id_kategori);
//     if (!kategori) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

//     // Jika ada perubahan validator, cek keberadaannya
//     if (nik_validator) {
//       const validator = await Validator.findByPk(nik_validator);
//       if (!validator) {
//         return res.status(404).json({ message: 'Validator tidak ditemukan' });
//       }
//     }

//     kategori.nama_layanan = nama_layanan ?? kategori.nama_layanan;
//     kategori.deskripsi = deskripsi ?? kategori.deskripsi;
//     kategori.nik_validator = nik_validator ?? kategori.nik_validator;

//     await kategori.save();
//     res.json({ message: 'Kategori layanan diperbarui', kategori });
//   } catch (err) {
//     res.status(500).json({ message: 'Gagal memperbarui kategori layanan', error: err.message });
//   }
// };

// Tambahkan kategori layanan baru + validasi validator
const createCategory = async (req, res) => {
  const { nama_layanan, deskripsi, nik_validator } = req.body;

  if (!nama_layanan || !nik_validator) {
    return res.status(400).json({ message: 'Nama layanan dan nik_validator wajib diisi' });
  }

  try {
    // Pastikan validator ada
    const validator = await Validator.findByPk(nik_validator);
    if (!validator) {
      return res.status(404).json({ message: 'Validator tidak ditemukan' });
    }

    // 🔥 Cek apakah validator sudah dipakai di kategori lain
    const existingCategory = await BugCategory.findOne({ where: { nik_validator } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Validator ini sudah ditetapkan ke kategori lain' });
    }

    const kategori = await BugCategory.create({ nama_layanan, deskripsi, nik_validator });
    res.status(201).json({ message: 'Kategori layanan berhasil dibuat dan validator ditetapkan', kategori });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat kategori layanan', error: err.message });
  }
};

// Perbarui kategori layanan + validasi perubahan validator
const updateCategory = async (req, res) => {
  const { id_kategori } = req.params;
  const { nama_layanan, deskripsi, nik_validator } = req.body;

  try {
    const kategori = await BugCategory.findByPk(id_kategori);
    if (!kategori) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    if (nik_validator) {
      // Pastikan validator ada
      const validator = await Validator.findByPk(nik_validator);
      if (!validator) {
        return res.status(404).json({ message: 'Validator tidak ditemukan' });
      }

      // 🔥 Cek apakah validator sudah dipakai kategori lain (kecuali kategori ini sendiri)
      const existingCategory = await BugCategory.findOne({
        where: { nik_validator, id_kategori: { [Op.ne]: id_kategori } }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Validator ini sudah ditetapkan ke kategori lain' });
      }
    }

    kategori.nama_layanan = nama_layanan ?? kategori.nama_layanan;
    kategori.deskripsi = deskripsi ?? kategori.deskripsi;
    kategori.nik_validator = nik_validator ?? kategori.nik_validator;

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

// Revisi laporan bug oleh admin kategori
const revisiBugReport = async (req, res) => {
  const { id_laporan } = req.params;
  const { catatan_revisi } = req.body;

  if (!catatan_revisi) {
    return res.status(400).json({ message: 'Catatan revisi wajib diisi' });
  }

  try {
    const laporan = await BugReport.findByPk(id_laporan);
    if (!laporan) return res.status(404).json({ message: 'Laporan bug tidak ditemukan' });

    laporan.catatan_revisi = catatan_revisi;
    laporan.status = 'revisi';
    await laporan.save();

    res.json({ message: 'Revisi laporan bug berhasil disimpan', laporan });
  } catch (err) {
    res.status(500).json({ message: 'Gagal merevisi laporan bug', error: err.message });
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
