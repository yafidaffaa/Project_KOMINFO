const Teknisi = require('../models/teknisi');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat teknisi baru
const createTeknisi = async (req, res) => {
  const { username, password, nik_teknisi, nip_teknisi, nama, alamat, email, no_hp, nik_validator } = req.body;

  // Cek role
  if (!['admin_sa', 'admin_kategori'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Tidak memiliki akses' });
  }

  // Validasi input dasar
  if (!username || !password || !nik_teknisi || !nip_teknisi || !nama) {
    return res.status(400).json({ message: 'Data wajib tidak lengkap' });
  }
  if (nik_teknisi.length !== 16 || !/^\d+$/.test(nik_teknisi)) {
    return res.status(400).json({ message: 'NIK harus 16 digit angka' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }

  try {
    // Cek username
    const existingUsername = await Akun.findOne({ where: { username } });
    if (existingUsername) return res.status(409).json({ message: 'Username sudah digunakan' });

    // Cek NIK
    const existingNIK = await Teknisi.findOne({ where: { nik_teknisi } });
    if (existingNIK) return res.status(409).json({ message: 'NIK sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat akun
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'teknisi'
    });

    // Buat profil teknisi
    const teknisi = await Teknisi.create({
  nik_teknisi,
  nip_teknisi,
  nama,
  alamat,
  email,
  no_hp,
  nik_validator, // <== ini yang sebelumnya tidak ada
  id_akun: akunBaru.id_akun
});

    res.status(201).json({ message: 'Teknisi berhasil dibuat', teknisi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat teknisi', error: error.message });
  }
};

// Mendapatkan semua teknisi
const getAllTeknisi = async (req, res) => {
  try {
    const teknisi = await Teknisi.findAll({
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });
    res.json(teknisi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data teknisi', error: error.message });
  }
};

// Mendapatkan teknisi berdasarkan NIK
const getTeknisiById = async (req, res) => {
  try {
    const teknisi = await Teknisi.findOne({
      where: { nik_teknisi: req.params.nik },
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
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

    // Batasi field yang bisa diupdate
    const allowedFields = ['nip_teknisi', 'nama', 'alamat', 'email', 'no_hp'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field]) updateData[field] = req.body[field];
    });

    await teknisi.update(updateData);

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

    // Hapus profil dulu supaya tidak terkena FK constraint
    await teknisi.destroy();
    // Baru hapus akun
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
