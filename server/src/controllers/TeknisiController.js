const Teknisi = require('../models/teknisi');
const Akun = require('../models/akun');
const Validator = require('../models/validator');
const bcrypt = require('bcrypt');
const UserUmum = require('../models/user_umum');
const AdminKategori = require('../models/admin_kategori');
const AdminSA = require('../models/admin_sa');
const Pencatat = require('../models/pencatat');

// Membuat teknisi baru
const createTeknisi = async (req, res) => {
  const { username, password, nik_teknisi, nip_teknisi, nama, alamat, email, no_hp, nik_validator } = req.body;

  // Cek role
  if (!['admin_sa', 'admin_kategori'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Tidak memiliki akses untuk membuat teknisi' });
  }

  // Validasi field wajib
  if (!username || !password || !nik_teknisi || !nip_teknisi || !nama || !nik_validator) {
    return res.status(400).json({ message: 'Username, password, NIK, NIP, nama, dan NIK validator wajib diisi' });
  }

  // Validasi format NIK teknisi
  if (nik_teknisi.length !== 16 || !/^\d+$/.test(nik_teknisi)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  // Validasi format NIP
  if (nip_teknisi.length !== 18 || !/^\d+$/.test(nip_teknisi)) {
    return res.status(400).json({ message: 'NIP harus terdiri dari 18 digit angka' });
  }

  // Validasi format NIK validator
  if (nik_validator.length !== 16 || !/^\d+$/.test(nik_validator)) {
    return res.status(400).json({ message: 'NIK validator harus terdiri dari 16 digit angka' });
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

    // Cek NIK teknisi sudah terdaftar
    const existingNIK = await Teknisi.findOne({ where: { nik_teknisi } });
    if (existingNIK) {
      return res.status(409).json({ message: 'NIK sudah terdaftar' });
    }

    // Cek NIP sudah terdaftar
    const existingNIP = await Teknisi.findOne({ where: { nip_teknisi } });
    if (existingNIP) {
      return res.status(409).json({ message: 'NIP sudah terdaftar' });
    }

    // Cek email sudah terdaftar (jika diisi)
    if (email) {
      const existingEmail = await Teknisi.findOne({ where: { email } });
      const existingEmailUserUmum = await UserUmum.findOne({ where: { email } });
      const existingEmailAdminKategori = await AdminKategori.findOne({ where: { email } });
      const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
      const existingEmailPencatat = await Pencatat.findOne({ where: { email } });
      const existingEmailValidator = await Validator.findOne({ where: { email } });
      if (existingEmail || existingEmailUserUmum || existingEmailAdminKategori || existingEmailAdminSA || existingEmailPencatat || existingEmailValidator) {
        return res.status(409).json({ message: 'Email sudah digunakan. Gunakan email yang belum terdaftar' });
      }
    }

    // Cek apakah validator exists
    const validatorExists = await Validator.findOne({ where: { nik_validator } });
    if (!validatorExists) {
      return res.status(404).json({ message: 'Validator dengan NIK tersebut tidak ditemukan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat akun baru
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role: 'teknisi'
    });

    // Buat teknisi baru
    const teknisi = await Teknisi.create({
      nik_teknisi,
      nip_teknisi,
      nama,
      alamat,
      email,
      no_hp,
      nik_validator,
      id_akun: akunBaru.id_akun
    });

    res.status(201).json({
      message: 'Teknisi berhasil dibuat',
      data: {
        nik_teknisi: teknisi.nik_teknisi,
        nip_teknisi: teknisi.nip_teknisi,
        nama: teknisi.nama,
        alamat: teknisi.alamat,
        email: teknisi.email,
        no_hp: teknisi.no_hp,
        nik_validator: teknisi.nik_validator,
        username: akunBaru.username
      }
    });
  } catch (error) {
    console.error('Error create teknisi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat teknisi', error: error.message });
  }
};

// Mendapatkan semua teknisi
const getAllTeknisi = async (req, res) => {
  try {
    const teknisi = await Teknisi.findAll({
      include: [
        {
          model: Akun,
          attributes: { exclude: ['password'] }
        },
        {
          model: Validator,
          attributes: ['nik_validator', 'nama', 'nip_validator']
        }
      ]
    });

    if (teknisi.length === 0) {
      return res.status(200).json({ message: 'Belum ada data teknisi', data: [] });
    }

    res.status(200).json({
      message: 'Data teknisi berhasil diambil',
      total: teknisi.length,
      data: teknisi
    });
  } catch (error) {
    console.error('Error get all teknisi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data teknisi', error: error.message });
  }
};

// Mendapatkan teknisi berdasarkan NIK
const getTeknisiById = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const teknisi = await Teknisi.findOne({
      where: { nik_teknisi: nik },
      include: [
        {
          model: Akun,
          attributes: { exclude: ['password'] }
        },
        {
          model: Validator,
          attributes: ['nik_validator', 'nama', 'nip_validator']
        }
      ]
    });

    if (!teknisi) {
      return res.status(404).json({ message: 'Teknisi dengan NIK tersebut tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Data teknisi berhasil diambil',
      data: teknisi
    });
  } catch (error) {
    console.error('Error get teknisi by id:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data teknisi', error: error.message });
  }
};

// Mengupdate teknisi
const updateTeknisi = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const teknisi = await Teknisi.findOne({ where: { nik_teknisi: nik } });

    if (!teknisi) {
      return res.status(404).json({ message: 'Teknisi dengan NIK tersebut tidak ditemukan' });
    }

    // Validasi data yang akan diupdate
    const { nip_teknisi, nama, alamat, email, no_hp, nik_validator } = req.body;

    // Cek apakah ada data yang akan diupdate
    if (!nip_teknisi && !nama && !alamat && email === undefined && no_hp === undefined && !nik_validator) {
      return res.status(400).json({ message: 'Tidak ada data yang akan diperbarui' });
    }

    // Validasi format NIP jika diupdate
    if (nip_teknisi) {
      if (nip_teknisi.length !== 18 || !/^\d+$/.test(nip_teknisi)) {
        return res.status(400).json({ message: 'NIP harus terdiri dari 18 digit angka' });
      }
      // Cek NIP sudah digunakan teknisi lain
      const existingNIP = await Teknisi.findOne({
        where: { nip_teknisi, nik_teknisi: { [require('sequelize').Op.ne]: nik } }
      });
      if (existingNIP) {
        return res.status(409).json({ message: 'NIP sudah terdaftar pada teknisi lain' });
      }
    }

    // Validasi format email jika diupdate
    if (email !== undefined) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Format email tidak valid' });
      }
      // Cek email sudah digunakan teknisi lain
      if (email) {
        const existingEmail = await Teknisi.findOne({
          where: { email, nik_teknisi: { [require('sequelize').Op.ne]: nik } }
        });
        const existingEmailUserUmum = await UserUmum.findOne({ where: { email } });
        const existingEmailAdminKategori = await AdminKategori.findOne({ where: { email } });
        const existingEmailAdminSA = await AdminSA.findOne({ where: { email } });
        const existingEmailPencatat = await Pencatat.findOne({ where: { email } });
        const existingEmailValidator = await Validator.findOne({ where: { email } });
        if (existingEmail || existingEmailUserUmum || existingEmailAdminKategori || existingEmailAdminSA || existingEmailPencatat || existingEmailValidator) {
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

    // Validasi NIK validator jika diupdate
    if (nik_validator) {
      if (nik_validator.length !== 16 || !/^\d+$/.test(nik_validator)) {
        return res.status(400).json({ message: 'NIK validator harus terdiri dari 16 digit angka' });
      }
      // Cek apakah validator exists
      const validatorExists = await Validator.findOne({ where: { nik_validator } });
      if (!validatorExists) {
        return res.status(404).json({ message: 'Validator dengan NIK tersebut tidak ditemukan' });
      }
    }

    // Update data
    const updateData = {};
    if (nip_teknisi) updateData.nip_teknisi = nip_teknisi;
    if (nama) updateData.nama = nama;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (email !== undefined) updateData.email = email;
    if (no_hp !== undefined) updateData.no_hp = no_hp;
    if (nik_validator) updateData.nik_validator = nik_validator;

    await teknisi.update(updateData);

    const updatedTeknisi = await Teknisi.findOne({
      where: { nik_teknisi: nik },
      include: [
        {
          model: Akun,
          attributes: { exclude: ['password'] }
        },
        {
          model: Validator,
          attributes: ['nik_validator', 'nama', 'nip_validator']
        }
      ]
    });

    res.status(200).json({
      message: 'Data teknisi berhasil diperbarui',
      data: updatedTeknisi
    });
  } catch (error) {
    console.error('Error update teknisi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data teknisi', error: error.message });
  }
};

// Menghapus teknisi
const deleteTeknisi = async (req, res) => {
  const { nik } = req.params;

  // Validasi format NIK
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
  }

  try {
    const teknisi = await Teknisi.findOne({ where: { nik_teknisi: nik } });

    if (!teknisi) {
      return res.status(404).json({ message: 'Teknisi dengan NIK tersebut tidak ditemukan' });
    }

    const id_akun = teknisi.id_akun;

    // Hapus teknisi terlebih dahulu
    await teknisi.destroy();

    // Hapus akun terkait
    await Akun.destroy({ where: { id_akun } });

    res.status(200).json({ message: 'Teknisi berhasil dihapus' });
  } catch (error) {
    console.error('Error delete teknisi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus teknisi', error: error.message });
  }
};

module.exports = {
  createTeknisi,
  getAllTeknisi,
  getTeknisiById,
  updateTeknisi,
  deleteTeknisi
};