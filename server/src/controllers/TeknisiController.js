const Teknisi = require('../models/teknisi');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat teknisi baru
const createTeknisi = async (req, res) => {
  const { username, password, nik_teknisi, nama, alamat, email, no_hp } = req.body;

  try {
    const existing = await Akun.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'Username sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'teknisi'
    });

    const teknisi = await Teknisi.create({
      nik_teknisi,
      nama,
      alamat,
      email,
      no_hp,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({ message: 'Teknisi berhasil dibuat', teknisi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat teknisi', error: error.message });
  }
};

// Menampilkan semua teknisi
const getAllTeknisi = async (req, res) => {
  try {
    const teknisi = await Teknisi.findAll({ include: Akun });
    res.json(teknisi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data teknisi', error: error.message });
  }
};

// Menampilkan satu teknisi berdasarkan NIK
const getTeknisiById = async (req, res) => {
  try {
    const teknisi = await Teknisi.findOne({
      where: { nik_teknisi: req.params.nik },
      include: Akun
    });

    if (!teknisi) return res.status(404).json({ message: 'Teknisi tidak ditemukan' });
    res.json(teknisi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data teknisi', error: error.message });
  }
};

// Mengupdate teknisi
const updateTeknisi = async (req, res) => {
  try {
    const teknisi = await Teknisi.findOne({ where: { nik_teknisi: req.params.nik } });

    if (!teknisi) return res.status(404).json({ message: 'Teknisi tidak ditemukan' });

    await teknisi.update(req.body);
    res.json({ message: 'Data teknisi berhasil diperbarui', teknisi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui data teknisi', error: error.message });
  }
};

// Menghapus teknisi
const deleteTeknisi = async (req, res) => {
  try {
    const teknisi = await Teknisi.findOne({ where: { nik_teknisi: req.params.nik } });

    if (!teknisi) return res.status(404).json({ message: 'Teknisi tidak ditemukan' });

    await Akun.destroy({ where: { id_akun: teknisi.id_akun } });
    res.json({ message: 'Teknisi berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus teknisi', error: error.message });
  }
};

module.exports = {
  createTeknisi,
  getAllTeknisi,
  getTeknisiById,
  updateTeknisi,
  deleteTeknisi
};
