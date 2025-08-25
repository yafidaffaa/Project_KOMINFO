const UserUmum = require('../models/user_umum');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat user umum baru
const createUserUmum = async (req, res) => {
  const { username, password, nama, nik_user, email } = req.body;

  // Validasi input wajib
  if (!username || !password || !nama || !nik_user) {
    return res.status(400).json({ message: 'Data wajib tidak lengkap' });
  }

  if (nik_user.length !== 16 || !/^\d+$/.test(nik_user)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }

  try {
    // Cek username unik
    const existingUsername = await Akun.findOne({ where: { username } });
    if (existingUsername) return res.status(409).json({ message: 'Username sudah digunakan' });

    // Cek NIK unik
    const existingNIK = await UserUmum.findOne({ where: { nik_user } });
    if (existingNIK) return res.status(409).json({ message: 'NIK sudah digunakan' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat akun
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'user_umum'
    });

    // Buat user umum
    const user = await UserUmum.create({
      nik_user,
      nama,
      email,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({ message: 'User berhasil dibuat', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat user', error: error.message });
  }
};

// Mendapatkan semua user umum
const getAllUserUmum = async (req, res) => {
  try {
    const users = await UserUmum.findAll({
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data user', error: error.message });
  }
};

// Mendapatkan user umum berdasarkan NIK
const getUserUmumById = async (req, res) => {
  try {
    const user = await UserUmum.findOne({
      where: { nik_user: req.params.nik },
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data user', error: error.message });
  }
};

// Memperbarui data user umum
const updateUserUmum = async (req, res) => {
  try {
    const user = await UserUmum.findOne({ where: { nik_user: req.params.nik } });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Hanya izinkan update nama & email
    const allowedFields = ['nama', 'email'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    await user.update(updateData);
    res.json({ message: 'Data user berhasil diperbarui', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui data user', error: error.message });
  }
};

// Menghapus user umum
const deleteUserUmum = async (req, res) => {
  try {
    const user = await UserUmum.findOne({ where: { nik_user: req.params.nik } });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Hapus user_umum dulu baru akun untuk hindari error foreign key
    await user.destroy();
    await Akun.destroy({ where: { id_akun: user.id_akun } });

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus user', error: error.message });
  }
};

module.exports = {
  createUserUmum,
  getAllUserUmum,
  getUserUmumById,
  updateUserUmum,
  deleteUserUmum
};
