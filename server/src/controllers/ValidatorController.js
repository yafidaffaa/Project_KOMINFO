const Validator = require('../models/validator');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat validator baru
const createValidator = async (req, res) => {
  const { username, password, nik_validator, nip_validator, nama, alamat, email, no_hp } = req.body;

  // Cek role
  if (!['admin_sa', 'admin_kategori'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Tidak memiliki akses' });
  }

  // Validasi
  if (!username || !password || !nik_validator || !nip_validator || !nama) {
    return res.status(400).json({ message: 'Data wajib tidak lengkap' });
  }
  if (nik_validator.length !== 16 || !/^\d+$/.test(nik_validator)) {
    return res.status(400).json({ message: 'NIK harus 16 digit angka' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }

  try {
    const existingUsername = await Akun.findOne({ where: { username } });
    if (existingUsername) return res.status(409).json({ message: 'Username sudah digunakan' });

    const existingNIK = await Validator.findOne({ where: { nik_validator } });
    if (existingNIK) return res.status(409).json({ message: 'NIK sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'validator'
    });

    const validator = await Validator.create({
      nik_validator,
      nip_validator,
      nama,
      alamat,
      email,
      no_hp,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({ message: 'Validator berhasil dibuat', validator });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat validator', error: error.message });
  }
};

// Mendapatkan semua validator
const getAllValidator = async (req, res) => {
  try {
    const validator = await Validator.findAll({
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });
    res.json(validator);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data validator' });
  }
};

// Mendapatkan validator berdasarkan NIK
const getValidatorById = async (req, res) => {
  try {
    const validator = await Validator.findOne({
      where: { nik_validator: req.params.nik },
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    if (!validator) return res.status(404).json({ message: 'Validator tidak ditemukan' });
    res.json(validator);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data validator' });
  }
};

// Mengupdate validator
const updateValidator = async (req, res) => {
  try {
    const validator = await Validator.findOne({ where: { nik_validator: req.params.nik } });

    if (!validator) return res.status(404).json({ message: 'Validator tidak ditemukan' });

    // Batasi field yang bisa diupdate
    const allowedFields = ['nip_validator', 'nama', 'alamat', 'email', 'no_hp'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field]) updateData[field] = req.body[field];
    });

    await validator.update(updateData);
    res.json({ message: 'Data validator berhasil diperbarui', validator });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui data validator', error: error.message });
  }
};

// Menghapus validator
const deleteValidator = async (req, res) => {
  try {
    const validator = await Validator.findOne({ where: { nik_validator: req.params.nik } });

    if (!validator) return res.status(404).json({ message: 'Validator tidak ditemukan' });

    // Hapus profil dulu
    await validator.destroy();
    // Baru hapus akun
    await Akun.destroy({ where: { id_akun: validator.id_akun } });

    res.json({ message: 'Validator berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus validator', error: error.message });
  }
};

module.exports = {
  createValidator,
  getAllValidator,
  getValidatorById,
  updateValidator,
  deleteValidator
};
