const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Akun = require('../models/akun');
const AdminSA = require('../models/admin_sa');
const UserUmum = require('../models/user_umum');
const Pencatat = require('../models/pencatat');
const Validator = require('../models/validator');
const Teknisi = require('../models/teknisi');
const AdminKategori = require('../models/admin_kategori');

// ========================
// LOGIN
// ========================
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const akun = await Akun.findOne({ where: { username } });
    if (!akun) return res.status(401).json({ message: 'Username tidak ditemukan' });

    const validPassword = await bcrypt.compare(password, akun.password);
    if (!validPassword) return res.status(401).json({ message: 'Password salah' });

    let profil = null;

    switch (akun.role) {
      case 'admin_sa':
        profil = await AdminSA.findOne({ where: { id_akun: akun.id_akun } });
        break;
      case 'user_umum':
        profil = await UserUmum.findOne({ where: { id_akun: akun.id_akun } });
        break;
      case 'pencatat':
        profil = await Pencatat.findOne({ where: { id_akun: akun.id_akun } });
        break;
      case 'validator':
        profil = await Validator.findOne({ where: { id_akun: akun.id_akun } });
        break;
      case 'teknisi':
        profil = await Teknisi.findOne({ where: { id_akun: akun.id_akun } });
        break;
      case 'admin_kategori':
        profil = await AdminKategori.findOne({ where: { id_akun: akun.id_akun } });
        break;
      default:
        return res.status(403).json({ message: 'Role tidak dikenali' });
    }

    if (!profil) return res.status(404).json({ message: 'Data profil tidak ditemukan' });

    const token = jwt.sign({
      id_akun: akun.id_akun,
      username: akun.username,
      role: akun.role,
      nama: profil.nama || profil.nama_lengkap
    }, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '1h' });

    res.json({ message: 'Login berhasil', token, profil });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saat login' });
  }
};

// ========================
// REGISTER USER UMUM
// ========================
const register = async (req, res) => {
  const { username, password, konfirmasiPassword, nama, nik_user, email } = req.body;

  // === Validasi input dasar ===
  if (!username || !password || !konfirmasiPassword || !nama || !nik_user) {
    return res.status(400).json({ message: 'Data wajib tidak lengkap' });
  }

  // === Validasi password ===
  if (password !== konfirmasiPassword) {
    return res.status(400).json({ message: 'Password dan konfirmasi password tidak cocok' });
  }

  // === Validasi NIK panjang (16 digit) ===
  if (nik_user.length !== 16 || !/^\d+$/.test(nik_user)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  // === Validasi email jika ada ===
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }
  }

  try {
    // === Cek apakah username sudah dipakai ===
    const existing = await Akun.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // === Hash password ===
    const hashedPassword = await bcrypt.hash(password, 10);

    // === Simpan ke tabel akun ===
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'user_umum'
    });

    // === Simpan ke tabel user_umum ===
    await UserUmum.create({
      nik_user,
      nama,
      email,
      id_akun: akunBaru.id_akun
    });

    return res.status(201).json({
      message: 'Registrasi berhasil',
      data: {
        username,
        nama,
        nik_user,
        email
      }
    });

  } catch (error) {
    console.error('Error saat registrasi user umum:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat proses registrasi' });
  }
};

module.exports = { login, register };
