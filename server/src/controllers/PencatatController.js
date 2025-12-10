const Pencatat = require('../models/pencatat');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');
const UserUmum = require('../models/user_umum');
const AdminKategori = require('../models/admin_kategori');
const AdminSA = require('../models/admin_sa');
const Teknisi = require('../models/teknisi');
const Validator = require('../models/validator');

// Membuat pencatat baru
const createPencatat = async (req, res) => {
  const { username, password, nik_pencatat, nip_pencatat, nama, alamat, email, no_hp } = req.body;

  // Validasi field wajib
  if (!username || !password || !nik_pencatat || !nip_pencatat || !nama) {
    return res.status(400).json({ message: 'Username, password, NIK, NIP, dan nama wajib diisi' });
  }

  // Validasi format NIK
  if (nik_pencatat.length !== 16 || !/^\d+$/.test(nik_pencatat)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  // Validasi format NIP
  if (nip_pencatat.length !== 18 || !/^\d+$/.test(nip_pencatat)) {
    return res.status(400).json({ message: 'NIP harus terdiri dari 18 digit angka' });
  }

  // Validasi format email jika diisi
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }

  // Validasi format no_hp jika diisi
  if (no_hp && (no_hp.length < 10 || no_hp.length > 13 || !/^\d+$/.test(no_hp))) {
    return res.status(400).json({ message: 'Nomor HP harus terdiri dari 10-13 digit angka' });
  }

  try {
    // Cek username sudah digunakan
    const existingUsername = await Akun.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Cek NIK sudah terdaftar
    const existingNIK = await Pencatat.findOne({ where: { nik_pencatat } });
    if (existingNIK) {
      return res.status(409).json({ message: 'NIK sudah terdaftar' });
    }

    // Cek NIP sudah terdaftar
    const existingNIP = await Pencatat.findOne({ where: { nip_pencatat } });
    if (existingNIP) {
      return res.status(409).json({ message: 'NIP sudah terdaftar' });
    }

    // Cek email sudah terdaftar (jika diisi)
    if (email) {
      const existingEmail = await Pencatat.findOne({ where: { email } });
      const existingEmailUserUmum = await UserUmum.findOne({ where: { email } });
      const existingEmailAdminKategori = await AdminKategori.findOne({ where: { email } });
      const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
      const existingEmailTeknisi = await Teknisi.findOne({ where: { email } });
      const existingEmailValidator = await Validator.findOne({ where: { email } });
      if (existingEmail || existingEmailUserUmum || existingEmailAdminKategori || existingEmailAdminSA || existingEmailTeknisi || existingEmailValidator) {
        return res.status(409).json({ message: 'Email sudah digunakan. Gunakan email yang belum terdaftar' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat akun baru
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'pencatat'
    });

    // Buat pencatat baru
    const pencatat = await Pencatat.create({
      nik_pencatat,
      nip_pencatat,
      nama,
      alamat,
      email,
      no_hp,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({
      message: 'Pencatat berhasil dibuat',
      data: {
        nik_pencatat: pencatat.nik_pencatat,
        nip_pencatat: pencatat.nip_pencatat,
        nama: pencatat.nama,
        alamat: pencatat.alamat,
        email: pencatat.email,
        no_hp: pencatat.no_hp,
        username: akunBaru.username
      }
    });
  } catch (error) {
    console.error('Error create pencatat:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat pencatat', error: error.message });
  }
};

// Mendapatkan semua pencatat
const getAllPencatat = async (req, res) => {
  try {
    const pencatat = await Pencatat.findAll({
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    if (pencatat.length === 0) {
      return res.status(200).json({ message: 'Belum ada data pencatat', data: [] });
    }

    res.status(200).json({
      message: 'Data pencatat berhasil diambil',
      total: pencatat.length,
      data: pencatat
    });
  } catch (error) {
    console.error('Error get all pencatat:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pencatat', error: error.message });
  }
};

// Mendapatkan pencatat berdasarkan NIK
const getPencatatById = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const pencatat = await Pencatat.findOne({
      where: { nik_pencatat: nik },
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    if (!pencatat) {
      return res.status(404).json({ message: 'Pencatat dengan NIK tersebut tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Data pencatat berhasil diambil',
      data: pencatat
    });
  } catch (error) {
    console.error('Error get pencatat by id:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pencatat', error: error.message });
  }
};

// Mengupdate pencatat
const updatePencatat = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const pencatat = await Pencatat.findOne({ where: { nik_pencatat: nik } });

    if (!pencatat) {
      return res.status(404).json({ message: 'Pencatat dengan NIK tersebut tidak ditemukan' });
    }

    // Validasi data yang akan diupdate
    const { nip_pencatat, nama, alamat, email, no_hp } = req.body;

    // Cek apakah ada data yang akan diupdate
    if (!nip_pencatat && !nama && !alamat && email === undefined && no_hp === undefined) {
      return res.status(400).json({ message: 'Tidak ada data yang akan diperbarui' });
    }

    // Validasi format NIP jika diupdate
    if (nip_pencatat) {
      if (nip_pencatat.length !== 18 || !/^\d+$/.test(nip_pencatat)) {
        return res.status(400).json({ message: 'NIP harus terdiri dari 18 digit angka' });
      }
      // Cek NIP sudah digunakan pencatat lain
      const existingNIP = await Pencatat.findOne({
        where: { nip_pencatat, nik_pencatat: { [require('sequelize').Op.ne]: nik } }
      });
      if (existingNIP) {
        return res.status(409).json({ message: 'NIP sudah terdaftar pada pencatat lain' });
      }
    }

    // Validasi format email jika diupdate
    if (email !== undefined) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Format email tidak valid' });
      }
      // Cek email sudah digunakan pencatat lain
      if (email) {
        const existingEmail = await Pencatat.findOne({
          where: { email, nik_pencatat: { [require('sequelize').Op.ne]: nik } }
        });
        const existingEmailUserUmum = await UserUmum.findOne({ where: { email } });
        const existingEmailAdminKategori = await AdminKategori.findOne({ where: { email } });
        const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
        const existingEmailTeknisi = await Teknisi.findOne({ where: { email } });
        const existingEmailValidator = await Validator.findOne({ where: { email } });
        if (existingEmail || existingEmailUserUmum || existingEmailAdminKategori || existingEmailAdminSA || existingEmailTeknisi || existingEmailValidator) {
          return res.status(409).json({ message: 'Email sudah digunakan. Gunakan email yang belum terdaftar' });
        }
      }
    }

    // Validasi format no_hp jika diupdate
    if (no_hp !== undefined && no_hp) {
      if (no_hp.length < 10 || no_hp.length > 13 || !/^\d+$/.test(no_hp)) {
        return res.status(400).json({ message: 'Nomor HP harus terdiri dari 10-13 digit angka' });
      }
    }

    // Update data
    const updateData = {};
    if (nip_pencatat) updateData.nip_pencatat = nip_pencatat;
    if (nama) updateData.nama = nama;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (email !== undefined) updateData.email = email;
    if (no_hp !== undefined) updateData.no_hp = no_hp;

    await pencatat.update(updateData);

    const updatedPencatat = await Pencatat.findOne({
      where: { nik_pencatat: nik },
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    res.status(200).json({
      message: 'Data pencatat berhasil diperbarui',
      data: updatedPencatat
    });
  } catch (error) {
    console.error('Error update pencatat:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data pencatat', error: error.message });
  }
};

// Menghapus pencatat
const deletePencatat = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const pencatat = await Pencatat.findOne({ where: { nik_pencatat: nik } });

    if (!pencatat) {
      return res.status(404).json({ message: 'Pencatat dengan NIK tersebut tidak ditemukan' });
    }

    const id_akun = pencatat.id_akun;

    // Hapus pencatat terlebih dahulu
    await pencatat.destroy();

    // Hapus akun terkait
    await Akun.destroy({ where: { id_akun } });

    res.status(200).json({ message: 'Pencatat berhasil dihapus' });
  } catch (error) {
    console.error('Error delete pencatat:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus pencatat', error: error.message });
  }
};

module.exports = {
  createPencatat,
  getAllPencatat,
  getPencatatById,
  updatePencatat,
  deletePencatat
};