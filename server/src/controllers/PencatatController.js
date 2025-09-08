const Pencatat = require('../models/pencatat');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat pencatat baru
const createPencatat = async (req, res) => {
  const { username, password, nik_pencatat, nip_pencatat, nama, alamat, email, no_hp } = req.body;

  // Validasi input dasar
  if (!username || !password || !nik_pencatat || !nip_pencatat || !nama) {
    return res.status(400).json({ message: 'Data wajib tidak lengkap' });
  }

  if (nik_pencatat.length !== 16 || !/^\d+$/.test(nik_pencatat)) {
    return res.status(400).json({ message: 'NIK harus 16 digit angka' });
  }

  if (nip_pencatat.length !== 18 || !/^\d+$/.test(nip_pencatat)) {
    return res.status(400).json({ message: 'NIP harus 18 digit angka' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }

  try {
    // Cek username
    const existingUsername = await Akun.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Cek NIK
    const existingNIK = await Pencatat.findOne({ where: { nik_pencatat } });
    if (existingNIK) {
      return res.status(409).json({ message: 'NIK sudah digunakan' });
    }

    // Cek NIP
    const existingNIP = await Pencatat.findOne({ where: { nip_pencatat } });
    if (existingNIP) {
      return res.status(409).json({ message: 'NIP sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Gunakan transaksi biar aman kalau salah satu gagal
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'pencatat'
    });

    const pencatat = await Pencatat.create({
      nik_pencatat,
      nip_pencatat,
      nama,
      alamat,
      email,
      no_hp,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({ message: 'Pencatat berhasil dibuat', pencatat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat pencatat', error: error.message });
  }
};


const getAllPencatat = async (req, res) => {
  try {
    const pencatat = await Pencatat.findAll({
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });
    res.json(pencatat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data pencatat', error: error.message });
  }
};

// Menampilkan 1 pencatat berdasarkan NIK
const getPencatatById = async (req, res) => {
  try {
    const pencatat = await Pencatat.findOne({
      where: { nik_pencatat: req.params.nik },
      include: Akun
    });

    if (!pencatat) return res.status(404).json({ message: 'Pencatat tidak ditemukan' });
    res.json(pencatat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data pencatat', error: error.message });
  }
};

// Memperbarui data pencatat
const updatePencatat = async (req, res) => {
  try {
    const pencatat = await Pencatat.findOne({ where: { nik_pencatat: req.params.nik } });

    if (!pencatat) return res.status(404).json({ message: 'Pencatat tidak ditemukan' });

    await pencatat.update(req.body);
    res.json({ message: 'Data pencatat berhasil diperbarui', pencatat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui data pencatat', error: error.message });
  }
};

// Menghapus pencatat dan akun
const deletePencatat = async (req, res) => {
  try {
    const pencatat = await Pencatat.findOne({ where: { nik_pencatat: req.params.nik } });

    if (!pencatat) {
      return res.status(404).json({ message: 'Pencatat tidak ditemukan' });
    }

    // Hapus pencatat dulu
    await Pencatat.destroy({ where: { nik_pencatat: req.params.nik } });

    // Baru hapus akun
    await Akun.destroy({ where: { id_akun: pencatat.id_akun } });

    res.json({ message: 'Pencatat dan akun berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus pencatat', error: error.message });
  }
};


module.exports = {
  createPencatat,
  getAllPencatat,
  getPencatatById,
  updatePencatat,
  deletePencatat
};
