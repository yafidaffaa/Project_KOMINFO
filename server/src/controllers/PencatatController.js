const Pencatat = require('../models/pencatat');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat pencatat baru
const createPencatat = async (req, res) => {
  const { username, password, nik_pencatat, nama, alamat, email, no_hp } = req.body;

  try {
    const existing = await Akun.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'Username sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'pencatat'
    });

    const pencatat = await Pencatat.create({
      nik_pencatat,
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

// Menampilkan semua pencatat
const getAllPencatat = async (req, res) => {
  try {
    const pencatat = await Pencatat.findAll({ include: Akun });
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

    if (!pencatat) return res.status(404).json({ message: 'Pencatat tidak ditemukan' });

    await Akun.destroy({ where: { id_akun: pencatat.id_akun } });
    res.json({ message: 'Pencatat berhasil dihapus' });
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
