const UserUmum = require('../models/user_umum');
const AdminKategori = require('../models/admin_kategori');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');
const AdminSA = require('../models/admin_sa');
const Pencatat = require('../models/pencatat');
const Teknisi = require('../models/teknisi');
const Validator = require('../models/validator');

// Membuat user umum baru
const createUserUmum = async (req, res) => {
  const { username, password, nama, nik_user, email } = req.body;

  // Validasi field wajib
  if (!username || !password || !nama || !nik_user) {
    return res.status(400).json({ message: 'Username, password, nama, dan NIK wajib diisi' });
  }

  // Validasi format NIK
  if (nik_user.length !== 16 || !/^\d+$/.test(nik_user)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  // Validasi format email jika diisi
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }

  try {
    // Cek username sudah digunakan
    const existingUsername = await Akun.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Cek NIK sudah terdaftar
    const existingNIK = await UserUmum.findOne({ where: { nik_user } });
    if (existingNIK) {
      return res.status(409).json({ message: 'NIK sudah terdaftar' });
    }

    // Cek email sudah terdaftar (jika diisi)
    if (email) {
      const existingEmail = await UserUmum.findOne({ where: { email } });
      const existingEmailAdminKategori = await AdminKategori.findOne({ where: { email } });
      const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
      const existingEmailPencatat = await Pencatat.findOne({ where: { email } });
      const existingEmailTeknisi = await Teknisi.findOne({ where: { email } });
      const existingEmailValidator = await Validator.findOne({ where: { email } });
      if (existingEmail || existingEmailAdminKategori || existingEmailAdminSA || existingEmailPencatat || existingEmailTeknisi || existingEmailValidator) {
        return res.status(409).json({ message: 'Email sudah digunakan. Gunakan email yang belum terdaftar' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat akun baru
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'user_umum'
    });

    // Buat user umum baru
    const user = await UserUmum.create({
      nik_user,
      nama,
      email,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({
      message: 'User berhasil dibuat',
      data: {
        nik_user: user.nik_user,
        nama: user.nama,
        email: user.email,
        username: akunBaru.username
      }
    });
  } catch (error) {
    console.error('Error create user umum:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat user', error: error.message });
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

    if (users.length === 0) {
      return res.status(200).json({ message: 'Belum ada data user', data: [] });
    }

    res.status(200).json({
      message: 'Data user berhasil diambil',
      total: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error get all user umum:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data user', error: error.message });
  }
};

// Mendapatkan user umum berdasarkan NIK
const getUserUmumById = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const user = await UserUmum.findOne({
      where: { nik_user: nik },
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User dengan NIK tersebut tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Data user berhasil diambil',
      data: user
    });
  } catch (error) {
    console.error('Error get user umum by id:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data user', error: error.message });
  }
};

// Memperbarui data user umum
const updateUserUmum = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const user = await UserUmum.findOne({ where: { nik_user: nik } });

    if (!user) {
      return res.status(404).json({ message: 'User dengan NIK tersebut tidak ditemukan' });
    }

    // Validasi data yang akan diupdate
    const { nama, email } = req.body;

    // Cek apakah ada data yang akan diupdate
    if (!nama && email === undefined) {
      return res.status(400).json({ message: 'Tidak ada data yang akan diperbarui' });
    }

    // Validasi format email jika diupdate
    if (email !== undefined) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Format email tidak valid' });
      }
      // Cek email sudah digunakan user lain
      if (email) {
        const existingEmail = await UserUmum.findOne({
          where: { email, nik_user: { [require('sequelize').Op.ne]: nik } }
        });
        const existingEmailAdminKategori = await AdminKategori.findOne({ where: { email } });
        const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
        const existingEmailPencatat = await Pencatat.findOne({ where: { email } });
        const existingEmailTeknisi = await Teknisi.findOne({ where: { email } });
        const existingEmailValidator = await Validator.findOne({ where: { email } });
        if (existingEmail || existingEmailAdminKategori || existingEmailAdminSA || existingEmailPencatat || existingEmailTeknisi || existingEmailValidator) {
          return res.status(409).json({ message: 'Email sudah terdaftar pada user lain' });
        }
      }
    }

    // Update data
    const updateData = {};
    if (nama) updateData.nama = nama;
    if (email !== undefined) updateData.email = email;

    await user.update(updateData);

    const updatedUser = await UserUmum.findOne({
      where: { nik_user: nik },
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    res.status(200).json({
      message: 'Data user berhasil diperbarui',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error update user umum:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data user', error: error.message });
  }
};

// Menghapus user umum
const deleteUserUmum = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const user = await UserUmum.findOne({ where: { nik_user: nik } });

    if (!user) {
      return res.status(404).json({ message: 'User dengan NIK tersebut tidak ditemukan' });
    }

    const id_akun = user.id_akun;

    // Hapus user_umum terlebih dahulu
    await user.destroy();

    // Hapus akun terkait
    await Akun.destroy({ where: { id_akun } });

    res.status(200).json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Error delete user umum:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus user', error: error.message });
  }
};

module.exports = {
  createUserUmum,
  getAllUserUmum,
  getUserUmumById,
  updateUserUmum,
  deleteUserUmum
};