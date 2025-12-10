const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

  // Validasi field wajib
  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  try {
    // Cek apakah username exists
    const akun = await Akun.findOne({ where: { username } });
    if (!akun) {
      return res.status(401).json({ message: 'Username tidak ditemukan' });
    }

    // Validasi password
    const validPassword = await bcrypt.compare(password, akun.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Password salah' });
    }

    let profil = null;

    // Ambil profil sesuai role
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

    if (!profil) {
      return res.status(404).json({ message: 'Data profil tidak ditemukan' });
    }

    // Buat payload JWT
    let payload = {
      id_akun: akun.id_akun,
      username: akun.username,
      role: akun.role,
      nama: profil.nama || profil.nama_lengkap
    };

    // Tambahkan NIK sesuai role
    if (akun.role === 'user_umum') {
      payload.nik_user = profil.nik_user;
    } else if (akun.role === 'pencatat') {
      payload.nik_pencatat = profil.nik_pencatat;
    } else if (akun.role === 'validator') {
      payload.nik_validator = profil.nik_validator;
    } else if (akun.role === 'teknisi') {
      payload.nik_teknisi = profil.nik_teknisi;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login berhasil',
      token,
      profil
    });

  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login', error: error.message });
  }
};

// ========================
// REGISTER USER UMUM
// ========================
const register = async (req, res) => {
  const { username, password, konfirmasiPassword, nama, nik_user, email } = req.body;

  // Validasi field wajib
  if (!username || !password || !konfirmasiPassword || !nama || !nik_user) {
    return res.status(400).json({ message: 'Username, password, konfirmasi password, nama, dan NIK wajib diisi' });
  }

  // Validasi password match
  if (password !== konfirmasiPassword) {
    return res.status(400).json({ message: 'Password dan konfirmasi password tidak cocok' });
  }

  // Validasi panjang username
  if (username.length > 50) {
    return res.status(400).json({ message: 'Username maksimal 50 karakter' });
  }

  // Validasi format NIK
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
    // Cek apakah username sudah digunakan
    const existingUsername = await Akun.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Cek apakah NIK sudah terdaftar
    const existingNIK = await UserUmum.findOne({ where: { nik_user } });
    if (existingNIK) {
      return res.status(409).json({ message: 'NIK sudah terdaftar' });
    }

    // Cek apakah email sudah digunakan (jika ada)
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

    // Simpan ke tabel akun
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'user_umum'
    });

    // Simpan ke tabel user_umum
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
    console.error('Error register:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat registrasi', error: error.message });
  }
};

// ========================
// LUPA PASSWORD (REQUEST RESET)
// ========================
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validasi email wajib
  if (!email) {
    return res.status(400).json({ message: 'Email wajib diisi' });
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }

  try {
    // Cek apakah email terdaftar
    const user = await UserUmum.findOne({ where: { email }, include: Akun });
    if (!user) {
      return res.status(404).json({ message: 'Email tidak terdaftar' });
    }

    // Generate token reset (expired 5 menit)
    const resetToken = jwt.sign(
      { id_akun: user.id_akun, email },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '5m' }
    );

    // Konfigurasi transporter email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Isi email
    const resetLink = `http://${process.env.HOST}:5173/auth/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: `"Bug Handling Kominfosan Yogya" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Password',
      html: `
        <p>Halo, ${user.nama}</p>
        <p>Kamu meminta reset password. Klik link di bawah ini (berlaku 5 menit):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Jika kamu tidak meminta reset, abaikan email ini.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email reset password berhasil dikirim' });

  } catch (error) {
    console.error('Error forgot password:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengirim email reset password', error: error.message });
  }
};

// ========================
// RESET PASSWORD
// ========================
const resetPassword = async (req, res) => {
  const { token, passwordBaru } = req.body;

  // Validasi field wajib
  if (!token || !passwordBaru) {
    return res.status(400).json({ message: 'Token dan password baru wajib diisi' });
  }

  // Validasi panjang password
  if (passwordBaru.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');

    // Cek apakah akun exists
    const akun = await Akun.findByPk(decoded.id_akun);
    if (!akun) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(passwordBaru, 10);

    // Update password di tabel akun
    akun.password = hashedPassword;
    await akun.save();

    res.status(200).json({ message: 'Password berhasil direset' });

  } catch (error) {
    console.error('Error reset password:', error);

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Token tidak valid' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token sudah kadaluarsa' });
    }

    res.status(500).json({ message: 'Terjadi kesalahan saat reset password', error: error.message });
  }
};

module.exports = { login, register, forgotPassword, resetPassword };