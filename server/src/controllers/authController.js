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

    // ========================
    // Buat payload JWT
    // ========================
    let payload = {
      id_akun: akun.id_akun,
      username: akun.username,
      role: akun.role,
      nama: profil.nama || profil.nama_lengkap
    };

    // Tambahkan nik_user / nik_pencatat sesuai role
    if (akun.role === 'user_umum') {
      payload.nik_user = profil.nik_user;
    } else if (akun.role === 'pencatat') {
      payload.nik_pencatat = profil.nik_pencatat;
    }else if (akun.role === 'validator') {
      payload.nik_validator = profil.nik_validator;
    }else if (akun.role === 'teknisi') {
      payload.nik_teknisi = profil.nik_teknisi;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '1h' });

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

// 3. Lupa password (request reset)
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ message: 'Email wajib diisi' });

    // cek apakah email ada di database user_umum
    const user = await UserUmum.findOne({ where: { email }, include: Akun });
    if (!user) return res.status(404).json({ message: 'Email tidak ditemukan' });

    // generate token reset (expired 5 menit)
    const resetToken = jwt.sign(
      { id_akun: user.id_akun, email },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '5m' }
    );

    // buat transporter (pakai Gmail SMTP)
    const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,   // contoh: smtp.gmail.com
  port: process.env.EMAIL_PORT,   // contoh: 587
  secure: process.env.EMAIL_PORT == 465, // true kalau pakai port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


    // isi email
    const resetLink = `http://${process.env.HOST}:3000/auth/reset-password?token=${resetToken}`;
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

    res.json({ message: 'Email reset password berhasil dikirim' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memproses lupa password' });
  }
};

const resetPassword = async (req, res) => {
  const { token, passwordBaru } = req.body;

  try {
    if (!token || !passwordBaru) {
      return res.status(400).json({ message: 'Token dan password baru wajib diisi' });
    }

    // verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');

    // hash password baru
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(passwordBaru, 10);

    // update di tabel akun
    const akun = await Akun.findByPk(decoded.id_akun);
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });

    akun.password = hashedPassword;
    await akun.save();

    res.json({ message: 'Password berhasil direset' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};


module.exports = { login, register, forgotPassword, resetPassword };
