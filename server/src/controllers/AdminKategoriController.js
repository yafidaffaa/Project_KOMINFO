const AdminKategori = require('../models/admin_kategori');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');

// Membuat admin kategori baru
const createAdminKategori = async (req, res) => {
  const { username, password, nik_admin_kategori, nip_admin_kategori, nama, alamat, email, no_hp } = req.body;

  // Validasi input dasar
  if (!username || !password || !nik_admin_kategori || !nip_admin_kategori || !nama) {
    return res.status(400).json({ message: 'Data wajib tidak lengkap' });
  }

  if (nik_admin_kategori.length !== 16 || !/^\d+$/.test(nik_admin_kategori)) {
    return res.status(400).json({ message: 'NIK harus 16 digit angka' });
  }

  if (nip_admin_kategori.length !== 18 || !/^\d+$/.test(nip_admin_kategori)) {
    return res.status(400).json({ message: 'NIP harus 18 digit angka' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }

  try {
    // Cek username unik
    const existingUsername = await Akun.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Cek NIK unik
    const existingNIK = await AdminKategori.findOne({ where: { nik_admin_kategori } });
    if (existingNIK) {
      return res.status(409).json({ message: 'NIK sudah digunakan' });
    }

    // Cek NIP unik
    const existingNIP = await AdminKategori.findOne({ where: { nip_admin_kategori } });
    if (existingNIP) {
      return res.status(409).json({ message: 'NIP sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat akun admin kategori
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'admin_kategori'
    });

    // Buat data admin kategori
    const adminKategori = await AdminKategori.create({
      nik_admin_kategori,
      nip_admin_kategori,
      nama,
      alamat,
      email,
      no_hp,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({ message: 'Admin kategori berhasil dibuat', adminKategori });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat admin kategori', error: error.message });
  }
};

// Mengambil semua admin kategori
const getAllAdminKategori = async (req, res) => {
  try {
    const adminKategori = await AdminKategori.findAll({
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });
    res.json(adminKategori);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data admin kategori', error: error.message });
  }
};

// Mengambil admin kategori berdasarkan NIK
const getAdminKategoriById = async (req, res) => {
  try {
    const adminKategori = await AdminKategori.findOne({
      where: { nik_admin_kategori: req.params.nik },
      include: Akun
    });

    if (!adminKategori) return res.status(404).json({ message: 'Admin kategori tidak ditemukan' });
    res.json(adminKategori);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data admin kategori', error: error.message });
  }
};

// Memperbarui data admin kategori
const updateAdminKategori = async (req, res) => {
  try {
    const adminKategori = await AdminKategori.findOne({ where: { nik_admin_kategori: req.params.nik } });

    if (!adminKategori) return res.status(404).json({ message: 'Admin kategori tidak ditemukan' });

    await adminKategori.update(req.body);
    res.json({ message: 'Data admin kategori berhasil diperbarui', adminKategori });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui data admin kategori', error: error.message });
  }
};

// Menghapus admin kategori & akun terkait
const deleteAdminKategori = async (req, res) => {
  try {
    const adminKategori = await AdminKategori.findOne({ where: { nik_admin_kategori: req.params.nik } });

    if (!adminKategori) {
      return res.status(404).json({ message: 'Admin kategori tidak ditemukan' });
    }

    // Hapus admin kategori
    await AdminKategori.destroy({ where: { nik_admin_kategori: req.params.nik } });

    // Hapus akun terkait
    await Akun.destroy({ where: { id_akun: adminKategori.id_akun } });

    res.json({ message: 'Admin kategori dan akun berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus admin kategori', error: error.message });
  }
};

module.exports = {
  createAdminKategori,
  getAllAdminKategori,
  getAdminKategoriById,
  updateAdminKategori,
  deleteAdminKategori
};
