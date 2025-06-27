const Akun = require('../models/akun');
const Admin = require('../models/admin');
const PIC = require('../models/pic');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari akun berdasarkan username
    const akun = await Akun.findOne({ where: { username } });
    if (!akun) return res.status(401).json({ message: 'Username tidak ditemukan' });

    // Cek password
    const validPassword = await bcrypt.compare(password, akun.password);
    if (!validPassword) return res.status(401).json({ message: 'Password salah' });

    // Ambil data profil sesuai role
    let profil = null;
    if (akun.role === 'admin') {
      profil = await Admin.findOne({ where: { id_akun: akun.id_akun } });
    } else if (akun.role === 'pic') {
      profil = await PIC.findOne({ where: { id_akun: akun.id_akun } });
    } else if (akun.role === 'user') {
      profil = await User.findOne({ where: { id_akun: akun.id_akun } });
    }

    // Jika profil tidak ditemukan (kasus langka)
    if (!profil) return res.status(404).json({ message: 'Data profil tidak ditemukan' });

    // Buat JWT token
    const token = jwt.sign({
      id_akun: akun.id_akun,
      username: akun.username,
      role: akun.role,
      nama_lengkap: profil.nama_lengkap
    }, 'SECRET_KEY', { expiresIn: '1h' });

    res.json({ message: 'Login berhasil', token, profil });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login };
