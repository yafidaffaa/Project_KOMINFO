const UserUmum = require('../models/user_umum');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat user umum baru (oleh admin super)
const createUserUmum = async (req, res) => {
  const { username, password, nama, nik_user, email } = req.body;

  // Validasi minimal
  if (!username || !password || !nama || !nik_user) {
    return res.status(400).json({ message: 'Data wajib tidak lengkap' });
  }

  // Validasi NIK 16 digit
  if (nik_user.length !== 16 || !/^\d+$/.test(nik_user)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  // Validasi email jika ada
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }
  }

  try {
    const existing = await Akun.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'Username sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'user_umum'  // Pastikan role ini konsisten dengan sistem login
    });

    const user = await UserUmum.create({
      nik_user,
      nama: nama,
      email,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({ message: 'User berhasil dibuat', user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat user', error: error.message });
  }
};

// Menampilkan semua user umum
const getAllUserUmum = async (req, res) => {
  try {
    const users = await UserUmum.findAll({ include: Akun });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data user', error: error.message });
  }
};

// Menampilkan user berdasarkan NIK
const getUserUmumById = async (req, res) => {
  try {
    const user = await UserUmum.findOne({
      where: { nik_user: req.params.nik },
      include: Akun
    });

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data user', error: error.message });
  }
};

// Mengupdate data user umum
const updateUserUmum = async (req, res) => {
  try {
    const user = await UserUmum.findOne({ where: { nik_user: req.params.nik } });

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Batasi field yang bisa diupdate kalau perlu (opsional)
    const allowedFields = ['nama', 'email'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field]) updateData[field] = req.body[field];
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

    // Hapus akun sekaligus user_umum
    await Akun.destroy({ where: { id_akun: user.id_akun } });
    await user.destroy();

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
