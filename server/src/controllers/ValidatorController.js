const Validator = require('../models/validator');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat validator baru
const createValidator = async (req, res) => {
  const { username, password, nik_validator, nama_lengkap, alamat, email, no_hp } = req.body;

  try {
    const existing = await Akun.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'Username sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'validator'
    });

    const validator = await Validator.create({
      nik_validator,
      nama_lengkap,
      alamat,
      email,
      no_hp,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({ message: 'Validator berhasil dibuat', validator });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat validator' });
  }
};

// Menampilkan semua validator
const getAllValidator = async (req, res) => {
  try {
    const validator = await Validator.findAll({ include: Akun });
    res.json(validator);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data validator' });
  }
};

// Menampilkan satu validator berdasarkan NIK
const getValidatorById = async (req, res) => {
  try {
    const validator = await Validator.findOne({
      where: { nik_validator: req.params.nik },
      include: Akun
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

    await validator.update(req.body);
    res.json({ message: 'Data validator berhasil diperbarui', validator });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui data validator' });
  }
};

// Menghapus validator
const deleteValidator = async (req, res) => {
  try {
    const validator = await Validator.findOne({ where: { nik_validator: req.params.nik } });

    if (!validator) return res.status(404).json({ message: 'Validator tidak ditemukan' });

    await Akun.destroy({ where: { id_akun: validator.id_akun } });
    res.json({ message: 'Validator berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus validator' });
  }
};

module.exports = {
  createValidator,
  getAllValidator,
  getValidatorById,
  updateValidator,
  deleteValidator
};
