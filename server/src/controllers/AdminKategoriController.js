const { Op } = require('sequelize');
const AdminKategori = require('../models/admin_kategori');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');
const UserUmum = require('../models/user_umum');
const AdminSA = require('../models/admin_sa');
const Pencatat = require('../models/pencatat');
const Teknisi = require('../models/teknisi');
const Validator = require('../models/validator');

// Membuat admin kategori baru
const createAdminKategori = async (req, res) => {
  const { username, password, nik_admin_kategori, nip_admin_kategori, nama, alamat, email, no_hp } = req.body;

  // Validasi field wajib
  if (!username || !password || !nik_admin_kategori || !nip_admin_kategori || !nama) {
    return res.status(400).json({ message: 'Username, password, NIK, NIP, dan nama wajib diisi' });
  }

  // Validasi panjang username
  if (username.length > 50) {
    return res.status(400).json({ message: 'Username maksimal 50 karakter' });
  }

  // Validasi panjang password
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }

  // Validasi format NIK
  if (nik_admin_kategori.length !== 16 || !/^\d+$/.test(nik_admin_kategori)) {
    return res.status(400).json({ message: 'NIK admin kategori harus terdiri dari 16 digit angka' });
  }

  // Validasi format NIP
  if (nip_admin_kategori.length !== 18 || !/^\d+$/.test(nip_admin_kategori)) {
    return res.status(400).json({ message: 'NIP admin kategori harus terdiri dari 18 digit angka' });
  }

  // Validasi panjang nama
  if (nama.length > 50) {
    return res.status(400).json({ message: 'Nama maksimal 50 karakter' });
  }

  // Validasi no_hp jika ada
  if (no_hp) {
    if (no_hp.length > 13 || !/^\d+$/.test(no_hp)) {
      return res.status(400).json({ message: 'Nomor HP maksimal 13 digit angka' });
    }
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
    const existingNIK = await AdminKategori.findOne({ where: { nik_admin_kategori } });
    if (existingNIK) {
      return res.status(409).json({ message: 'NIK admin kategori sudah terdaftar' });
    }

    // Cek apakah NIP sudah terdaftar
    const existingNIP = await AdminKategori.findOne({ where: { nip_admin_kategori } });
    if (existingNIP) {
      return res.status(409).json({ message: 'NIP admin kategori sudah terdaftar' });
    }

    // Cek apakah email sudah digunakan (jika ada)
    if (email) {
      const existingEmail = await AdminKategori.findOne({ where: { email } });
      const existingEmailUserUmum = await UserUmum.findOne({ where: { email } });
      const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
      const existingEmailPencatat = await Pencatat.findOne({ where: { email } });
      const existingEmailTeknisi = await Teknisi.findOne({ where: { email } });
      const existingEmailValidator = await Validator.findOne({ where: { email } });
      if (existingEmail || existingEmailUserUmum || existingEmailAdminSA || existingEmailPencatat || existingEmailTeknisi || existingEmailValidator) {
        return res.status(409).json({ message: 'Email sudah digunakan. Gunakan email yang belum terdaftar' });
      }
    }

    // Hash password
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

    // Ambil data lengkap dengan relasi
    const newAdminKategori = await AdminKategori.findByPk(nik_admin_kategori, {
      include: {
        model: Akun,
        attributes: ['id_akun', 'username', 'role']
      }
    });

    res.status(201).json({
      message: 'Admin kategori berhasil dibuat',
      data: newAdminKategori
    });
  } catch (error) {
    console.error('Error create admin kategori:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat admin kategori', error: error.message });
  }
};

// Mengambil semua admin kategori
const getAllAdminKategori = async (req, res) => {
  try {
    const adminKategori = await AdminKategori.findAll({
      include: {
        model: Akun,
        attributes: ['id_akun', 'username', 'role', 'created_at']
      },
      order: [['created_at', 'DESC']]
    });

    if (adminKategori.length === 0) {
      return res.status(200).json({ message: 'Belum ada data admin kategori', data: [] });
    }

    res.status(200).json({
      message: 'Data admin kategori berhasil diambil',
      total: adminKategori.length,
      data: adminKategori
    });
  } catch (error) {
    console.error('Error get all admin kategori:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data admin kategori', error: error.message });
  }
};

// Mengambil admin kategori berdasarkan NIK
const getAdminKategoriById = async (req, res) => {
  const { nik } = req.params;

  // Validasi NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK admin kategori harus terdiri dari 16 digit angka' });
  }

  try {
    const adminKategori = await AdminKategori.findOne({
      where: { nik_admin_kategori: nik },
      include: {
        model: Akun,
        attributes: ['id_akun', 'username', 'role', 'created_at']
      }
    });

    if (!adminKategori) {
      return res.status(404).json({ message: 'Admin kategori tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Data admin kategori berhasil diambil',
      data: adminKategori
    });
  } catch (error) {
    console.error('Error get admin kategori by id:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data admin kategori', error: error.message });
  }
};

// Memperbarui data admin kategori
const updateAdminKategori = async (req, res) => {
  const { nik } = req.params;
  const { nip_admin_kategori, nama, alamat, email, no_hp } = req.body;

  // Validasi NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK admin kategori harus terdiri dari 16 digit angka' });
  }

  try {
    const adminKategori = await AdminKategori.findOne({ where: { nik_admin_kategori: nik } });

    if (!adminKategori) {
      return res.status(404).json({ message: 'Admin kategori tidak ditemukan' });
    }

    // Cek apakah ada data yang akan diupdate
    if (!nip_admin_kategori && !nama && !alamat && email === undefined && no_hp === undefined) {
      return res.status(400).json({ message: 'Tidak ada data yang akan diperbarui' });
    }

    // Validasi NIP jika diupdate
    if (nip_admin_kategori) {
      if (nip_admin_kategori.length !== 18 || !/^\d+$/.test(nip_admin_kategori)) {
        return res.status(400).json({ message: 'NIP admin kategori harus terdiri dari 18 digit angka' });
      }

      // Cek apakah NIP sudah digunakan admin lain
      const existingNIP = await AdminKategori.findOne({
        where: {
          nip_admin_kategori,
          nik_admin_kategori: { [Op.ne]: nik }
        }
      });
      if (existingNIP) {
        return res.status(409).json({ message: 'NIP admin kategori sudah digunakan' });
      }
    }

    // Validasi nama jika diupdate
    if (nama) {
      if (nama.length > 50) {
        return res.status(400).json({ message: 'Nama maksimal 50 karakter' });
      }
    }

    // Validasi no_hp jika diupdate
    if (no_hp) {
      if (no_hp.length > 13 || !/^\d+$/.test(no_hp)) {
        return res.status(400).json({ message: 'Nomor HP maksimal 13 digit angka' });
      }
    }

    // Validasi email jika diupdate
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Format email tidak valid' });
      }

      // Cek apakah email sudah digunakan admin lain
      const existingEmail = await AdminKategori.findOne({
        where: {
          email,
          nik_admin_kategori: { [Op.ne]: nik }
        }
      });
      const existingEmailUserUmum = await UserUmum.findOne({ where: { email } });
      const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
      const existingEmailPencatat = await Pencatat.findOne({ where: { email } });
      const existingEmailTeknisi = await Teknisi.findOne({ where: { email } });
      const existingEmailValidator = await Validator.findOne({ where: { email } });
      if (existingEmail || existingEmailUserUmum || existingEmailAdminSA || existingEmailPencatat || existingEmailTeknisi || existingEmailValidator) {
        return res.status(409).json({ message: 'Email sudah digunakan. Gunakan email yang belum terdaftar' });
      }
    }

    // Update data
    const updateData = {};
    if (nip_admin_kategori) updateData.nip_admin_kategori = nip_admin_kategori;
    if (nama) updateData.nama = nama;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (email !== undefined) updateData.email = email;
    if (no_hp !== undefined) updateData.no_hp = no_hp;

    await adminKategori.update(updateData);

    // Ambil data yang sudah diupdate dengan relasi
    const updatedAdminKategori = await AdminKategori.findByPk(nik, {
      include: {
        model: Akun,
        attributes: ['id_akun', 'username', 'role']
      }
    });

    res.status(200).json({
      message: 'Data admin kategori berhasil diperbarui',
      data: updatedAdminKategori
    });
  } catch (error) {
    console.error('Error update admin kategori:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data admin kategori', error: error.message });
  }
};

// Menghapus admin kategori & akun terkait
const deleteAdminKategori = async (req, res) => {
  const { nik } = req.params;

  // Validasi NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK admin kategori harus terdiri dari 16 digit angka' });
  }

  try {
    const adminKategori = await AdminKategori.findOne({ where: { nik_admin_kategori: nik } });

    if (!adminKategori) {
      return res.status(404).json({ message: 'Admin kategori tidak ditemukan' });
    }

    const id_akun = adminKategori.id_akun;

    // Hapus admin kategori
    await AdminKategori.destroy({ where: { nik_admin_kategori: nik } });

    // Hapus akun terkait
    await Akun.destroy({ where: { id_akun } });

    res.status(200).json({ message: 'Admin kategori dan akun berhasil dihapus' });
  } catch (error) {
    console.error('Error delete admin kategori:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus admin kategori', error: error.message });
  }
};

module.exports = {
  createAdminKategori,
  getAllAdminKategori,
  getAdminKategoriById,
  updateAdminKategori,
  deleteAdminKategori
};