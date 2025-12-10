const Validator = require('../models/validator');
const Akun = require('../models/akun');
const bcrypt = require('bcrypt');
const UserUmum = require('../models/user_umum');
const AdminKategori = require('../models/admin_kategori');
const AdminSA = require('../models/admin_sa');
const Pencatat = require('../models/pencatat');
const Teknisi = require('../models/teknisi');

// Membuat validator baru
const createValidator = async (req, res) => {
  const { username, password, nik_validator, nip_validator, nama, alamat, email, no_hp } = req.body;

  // Cek role
  if (!['admin_sa', 'admin_kategori'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Tidak memiliki akses untuk membuat validator' });
  }

  // Validasi field wajib
  if (!username || !password || !nik_validator || !nip_validator || !nama) {
    return res.status(400).json({ message: 'Username, password, NIK, NIP, dan nama wajib diisi' });
  }

  // Validasi format NIK
  if (nik_validator.length !== 16 || !/^\d+$/.test(nik_validator)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  // Validasi format NIP
  if (nip_validator.length !== 18 || !/^\d+$/.test(nip_validator)) {
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

    // Cek NIK sudah digunakan
    const existingNIK = await Validator.findOne({ where: { nik_validator } });
    if (existingNIK) {
      return res.status(409).json({ message: 'NIK sudah terdaftar' });
    }

    // Cek NIP sudah digunakan
    const existingNIP = await Validator.findOne({ where: { nip_validator } });
    if (existingNIP) {
      return res.status(409).json({ message: 'NIP sudah terdaftar' });
    }

    // Cek email sudah digunakan (jika diisi)
    if (email) {
      const existingEmail = await Validator.findOne({ where: { email } });
      const existingEmailUserUmum = await UserUmum.findOne({ where: { email } });
      const existingEmailAdminKategori = await AdminKategori.findOne({ where: { email } });
      const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
      const existingEmailPencatat = await Pencatat.findOne({ where: { email } });
      const existingEmailTeknisi = await Teknisi.findOne({ where: { email } });
      if (existingEmail || existingEmailUserUmum || existingEmailAdminKategori || existingEmailAdminSA || existingEmailPencatat || existingEmailTeknisi) {
        return res.status(409).json({ message: 'Email sudah digunakan. Gunakan email yang belum terdaftar' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat akun baru
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'validator'
    });

    // Buat validator baru
    const validator = await Validator.create({
      nik_validator,
      nip_validator,
      nama,
      alamat,
      email,
      no_hp,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({
      message: 'Validator berhasil dibuat',
      validator: {
        nik_validator: validator.nik_validator,
        nip_validator: validator.nip_validator,
        nama: validator.nama,
        alamat: validator.alamat,
        email: validator.email,
        no_hp: validator.no_hp,
        username: akunBaru.username
      }
    });
  } catch (error) {
    console.error('Error create validator:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat validator', error: error.message });
  }
};

// Mendapatkan semua validator
const getAllValidator = async (req, res) => {
  try {
    const validator = await Validator.findAll({
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    if (validator.length === 0) {
      return res.status(200).json({ message: 'Belum ada data validator', data: [] });
    }

    res.status(200).json({
      message: 'Data validator berhasil diambil',
      total: validator.length,
      data: validator
    });
  } catch (error) {
    console.error('Error get all validator:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data validator', error: error.message });
  }
};

// Mendapatkan validator berdasarkan NIK
const getValidatorById = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const validator = await Validator.findOne({
      where: { nik_validator: nik },
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    if (!validator) {
      return res.status(404).json({ message: 'Validator dengan NIK tersebut tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Data validator berhasil diambil',
      data: validator
    });
  } catch (error) {
    console.error('Error get validator by id:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data validator', error: error.message });
  }
};

// Mengupdate validator
const updateValidator = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const validator = await Validator.findOne({ where: { nik_validator: nik } });

    if (!validator) {
      return res.status(404).json({ message: 'Validator dengan NIK tersebut tidak ditemukan' });
    }

    // Validasi data yang akan diupdate
    const { nip_validator, nama, alamat, email, no_hp } = req.body;

    // Cek apakah ada data yang akan diupdate
    if (!nip_validator && !nama && !alamat && email === undefined && no_hp === undefined) {
      return res.status(400).json({ message: 'Tidak ada data yang akan diperbarui' });
    }

    // Validasi format NIP jika diupdate
    if (nip_validator) {
      if (nip_validator.length !== 18 || !/^\d+$/.test(nip_validator)) {
        return res.status(400).json({ message: 'NIP harus terdiri dari 18 digit angka' });
      }
      // Cek NIP sudah digunakan validator lain
      const existingNIP = await Validator.findOne({
        where: { nip_validator, nik_validator: { [require('sequelize').Op.ne]: nik } }
      });
      if (existingNIP) {
        return res.status(409).json({ message: 'NIP sudah terdaftar pada validator lain' });
      }
    }

    // Validasi format email jika diupdate
    if (email !== undefined) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Format email tidak valid' });
      }
      // Cek email sudah digunakan validator lain
      if (email) {
        const existingEmail = await Validator.findOne({
          where: { email, nik_validator: { [require('sequelize').Op.ne]: nik } }
        });
        const existingEmailUserUmum = await UserUmum.findOne({ where: { email } });
        const existingEmailAdminKategori = await AdminKategori.findOne({ where: { email } });
        const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
        const existingEmailPencatat = await Pencatat.findOne({ where: { email } });
        const existingEmailTeknisi = await Teknisi.findOne({ where: { email } });
        if (existingEmail || existingEmailUserUmum || existingEmailAdminKategori || existingEmailAdminSA || existingEmailPencatat || existingEmailTeknisi) {
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
    if (nip_validator) updateData.nip_validator = nip_validator;
    if (nama) updateData.nama = nama;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (email !== undefined) updateData.email = email;
    if (no_hp !== undefined) updateData.no_hp = no_hp;

    await validator.update(updateData);

    const updatedValidator = await Validator.findOne({
      where: { nik_validator: nik },
      include: {
        model: Akun,
        attributes: { exclude: ['password'] }
      }
    });

    res.status(200).json({
      message: 'Data validator berhasil diperbarui',
      data: updatedValidator
    });
  } catch (error) {
    console.error('Error update validator:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data validator', error: error.message });
  }
};

// Menghapus validator
const deleteValidator = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const validator = await Validator.findOne({ where: { nik_validator: nik } });

    if (!validator) {
      return res.status(404).json({ message: 'Validator dengan NIK tersebut tidak ditemukan' });
    }

    const id_akun = validator.id_akun;

    // Hapus validator terlebih dahulu
    await validator.destroy();

    // Hapus akun terkait
    await Akun.destroy({ where: { id_akun } });

    res.status(200).json({ message: 'Validator berhasil dihapus' });
  } catch (error) {
    console.error('Error delete validator:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus validator', error: error.message });
  }
};

module.exports = {
  createValidator,
  getAllValidator,
  getValidatorById,
  updateValidator,
  deleteValidator
};