const UserUmum = require('../models/user_umum');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat user baru (khusus digunakan admin pusat, bukan register umum)
const createUserUmum = async (req, res) => {
  const { username, password, nama_lengkap, nik_user, alamat, email } = req.body;

  try {
    const existing = await Akun.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'Username sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'user'
    });

    const user = await UserUmum.create({
      nik_user,
      nama_lengkap,
      alamat,
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

// Menampilkan satu user berdasarkan NIK
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

    await user.update(req.body);
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
