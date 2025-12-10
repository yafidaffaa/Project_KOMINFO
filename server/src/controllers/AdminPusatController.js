const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const Akun = require('../models/akun');
const AdminSA = require('../models/admin_sa');
const Pencatat = require('../models/pencatat');
const UserUmum = require('../models/user_umum');
const Validator = require('../models/validator');
const Teknisi = require('../models/teknisi');
const AdminKategori = require('../models/admin_kategori');
const BugReport = require('../models/bug_report');

// =================== CRUD AKUN & PROFIL =================== //

// 1. Melihat semua user (akun)
const getAllUsers = async (req, res) => {
  try {
    const akun = await Akun.findAll({
      attributes: ['id_akun', 'username', 'role', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });

    if (akun.length === 0) {
      return res.status(200).json({ message: 'Belum ada data akun', data: [] });
    }

    res.status(200).json({
      message: 'Data akun berhasil diambil',
      total: akun.length,
      data: akun
    });
  } catch (error) {
    console.error('Error get all users:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data akun', error: error.message });
  }
};

// 2. Detail user berdasarkan role
const getUserDetailByRole = async (req, res) => {
  const { role } = req.params;

  // Validasi role
  const allowedRoles = ['admin_sa', 'pencatat', 'user_umum', 'validator', 'teknisi', 'admin_kategori'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid' });
  }

  try {
    let data;

    switch (role) {
      case 'admin_sa':
        data = await AdminSA.findAll({
          include: { model: Akun, attributes: ['username', 'role'] }
        });
        break;
      case 'pencatat':
        data = await Pencatat.findAll({
          include: { model: Akun, attributes: ['username', 'role'] }
        });
        break;
      case 'user_umum':
        data = await UserUmum.findAll({
          include: { model: Akun, attributes: ['username', 'role'] }
        });
        break;
      case 'validator':
        data = await Validator.findAll({
          include: { model: Akun, attributes: ['username', 'role'] }
        });
        break;
      case 'teknisi':
        data = await Teknisi.findAll({
          include: { model: Akun, attributes: ['username', 'role'] }
        });
        break;
      case 'admin_kategori':
        data = await AdminKategori.findAll({
          include: { model: Akun, attributes: ['username', 'role'] }
        });
        break;
    }

    if (data.length === 0) {
      return res.status(200).json({ message: `Belum ada data ${role}`, data: [] });
    }

    res.status(200).json({
      message: `Data ${role} berhasil diambil`,
      total: data.length,
      data
    });
  } catch (error) {
    console.error('Error get user detail by role:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data user berdasarkan role', error: error.message });
  }
};

// 3. Hapus akun dan data profil terkait
const deleteAkun = async (req, res) => {
  const { id_akun } = req.params;

  // Validasi ID akun
  if (!id_akun || isNaN(id_akun)) {
    return res.status(400).json({ message: 'ID akun harus berupa angka' });
  }

  try {
    const akun = await Akun.findByPk(id_akun);
    if (!akun) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' });
    }

    const { role } = akun;

    // Cek apakah user memiliki data terkait yang tidak bisa dihapus
    if (role === 'user_umum') {
      const relatedReports = await BugReport.count({ where: { nik_user: { [Op.ne]: null } } });
      if (relatedReports > 0) {
        // Opsional: bisa tambahkan pengecekan lebih spesifik per user
      }
    }

    // Hapus data profil sesuai role
    switch (role) {
      case 'admin_sa':
        await AdminSA.destroy({ where: { id_akun } });
        break;
      case 'pencatat':
        await Pencatat.destroy({ where: { id_akun } });
        break;
      case 'validator':
        await Validator.destroy({ where: { id_akun } });
        break;
      case 'teknisi':
        await Teknisi.destroy({ where: { id_akun } });
        break;
      case 'admin_kategori':
        await AdminKategori.destroy({ where: { id_akun } });
        break;
      case 'user_umum':
        await UserUmum.destroy({ where: { id_akun } });
        break;
    }

    // Hapus akun
    await akun.destroy();

    res.status(200).json({ message: 'Akun dan data profil berhasil dihapus' });
  } catch (error) {
    console.error('Error delete akun:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus akun', error: error.message });
  }
};

// 4. Monitoring dashboard
const getMonitoringData = async (req, res) => {
  try {
    const totalBug = await BugReport.count();
    const bugSelesai = await BugReport.count({ where: { status: 'selesai' } });
    const bugBelumSelesai = await BugReport.count({
      where: {
        status: {
          [Op.in]: ['diajukan', 'diproses', 'revisi']
        }
      }
    });

    const totalUser = await Akun.count();
    const totalPencatat = await Akun.count({ where: { role: 'pencatat' } });
    const totalTeknisi = await Akun.count({ where: { role: 'teknisi' } });
    const totalValidator = await Akun.count({ where: { role: 'validator' } });

    res.status(200).json({
      message: 'Data monitoring berhasil diambil',
      data: {
        totalBug,
        bugSelesai,
        bugBelumSelesai,
        totalUser,
        totalPencatat,
        totalTeknisi,
        totalValidator
      }
    });
  } catch (error) {
    console.error('Error get monitoring data:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data monitoring', error: error.message });
  }
};

// 5. Buat akun + profil berdasarkan role
const createUser = async (req, res) => {
  const { username, password, role, ...profilData } = req.body;

  // Validasi field wajib
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, dan role wajib diisi' });
  }

  // Validasi role
  const allowedRoles = ['admin_sa', 'pencatat', 'validator', 'teknisi', 'admin_kategori', 'user_umum'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid' });
  }

  // Validasi panjang username
  if (username.length > 50) {
    return res.status(400).json({ message: 'Username maksimal 50 karakter' });
  }

  // Validasi panjang password
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }

  // Validasi data profil sesuai role
  if (role === 'admin_sa' && (!profilData.nik_admin_sa || !profilData.nama || !profilData.nip_admin_sa)) {
    return res.status(400).json({ message: 'NIK, nama, dan NIP wajib diisi untuk Admin SA' });
  }

  if (role === 'pencatat' && (!profilData.nik_pencatat || !profilData.nama || !profilData.nip_pencatat)) {
    return res.status(400).json({ message: 'NIK, nama, dan NIP wajib diisi untuk Pencatat' });
  }

  if (role === 'validator' && (!profilData.nik_validator || !profilData.nama || !profilData.nip_validator)) {
    return res.status(400).json({ message: 'NIK, nama, dan NIP wajib diisi untuk Validator' });
  }

  if (role === 'teknisi' && (!profilData.nik_teknisi || !profilData.nama || !profilData.nip_teknisi)) {
    return res.status(400).json({ message: 'NIK, nama, dan NIP wajib diisi untuk Teknisi' });
  }

  if (role === 'user_umum' && (!profilData.nik_user || !profilData.nama)) {
    return res.status(400).json({ message: 'NIK dan nama wajib diisi untuk User Umum' });
  }

  try {
    // Cek apakah username sudah digunakan
    const existingUsername = await Akun.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Validasi NIK (16 digit)
    const nikField = role === 'admin_sa' ? profilData.nik_admin_sa :
      role === 'pencatat' ? profilData.nik_pencatat :
        role === 'validator' ? profilData.nik_validator :
          role === 'teknisi' ? profilData.nik_teknisi :
            role === 'user_umum' ? profilData.nik_user : null;

    if (nikField && (nikField.length !== 16 || !/^\d+$/.test(nikField))) {
      return res.status(400).json({ message: 'NIK harus terdiri dari 16 digit angka' });
    }

    // Validasi NIP (18 digit) untuk role yang memerlukan NIP
    if (['admin_sa', 'pencatat', 'validator', 'teknisi'].includes(role)) {
      const nipField = role === 'admin_sa' ? profilData.nip_admin_sa :
        role === 'pencatat' ? profilData.nip_pencatat :
          role === 'validator' ? profilData.nip_validator :
            profilData.nip_teknisi;

      if (nipField && (nipField.length !== 18 || !/^\d+$/.test(nipField))) {
        return res.status(400).json({ message: 'NIP harus terdiri dari 18 digit angka' });
      }
    }

    // Validasi email jika ada
    if (profilData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profilData.email)) {
        return res.status(400).json({ message: 'Format email tidak valid' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat akun baru
    const akunBaru = await Akun.create({
      username,
      password: hashedPassword,
      role
    });

    // Buat profil sesuai role
    switch (role) {
      case 'admin_sa':
        await AdminSA.create({ ...profilData, id_akun: akunBaru.id_akun });
        break;
      case 'pencatat':
        await Pencatat.create({ ...profilData, id_akun: akunBaru.id_akun });
        break;
      case 'validator':
        await Validator.create({ ...profilData, id_akun: akunBaru.id_akun });
        break;
      case 'teknisi':
        await Teknisi.create({ ...profilData, id_akun: akunBaru.id_akun });
        break;
      case 'admin_kategori':
        await AdminKategori.create({ ...profilData, id_akun: akunBaru.id_akun });
        break;
      case 'user_umum':
        await UserUmum.create({ ...profilData, id_akun: akunBaru.id_akun });
        break;
    }

    res.status(201).json({
      message: `User dengan role ${role} berhasil dibuat`,
      data: {
        username,
        role
      }
    });
  } catch (error) {
    console.error('Error create user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat user', error: error.message });
  }
};

// 6. Update data admin_sa
const updateAdminSA = async (req, res) => {
  const { nik_admin_sa } = req.params;
  const { nama, nip_admin_sa, no_hp, email, alamat } = req.body;

  // Validasi NIK admin_sa
  if (!nik_admin_sa || nik_admin_sa.length !== 16 || !/^\d+$/.test(nik_admin_sa)) {
    return res.status(400).json({ message: 'NIK admin SA harus terdiri dari 16 digit angka' });
  }

  try {
    const admin = await AdminSA.findByPk(nik_admin_sa);
    if (!admin) {
      return res.status(404).json({ message: 'Admin SA tidak ditemukan' });
    }

    // Cek apakah ada data yang akan diupdate
    if (!nama && !nip_admin_sa && !no_hp && !email && !alamat) {
      return res.status(400).json({ message: 'Tidak ada data yang akan diperbarui' });
    }

    // Validasi NIP jika diupdate
    if (nip_admin_sa) {
      if (nip_admin_sa.length !== 18 || !/^\d+$/.test(nip_admin_sa)) {
        return res.status(400).json({ message: 'NIP admin SA harus terdiri dari 18 digit angka' });
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
      const existingEmail = await AdminSA.findOne({
        where: {
          email,
          nik_admin_sa: { [Op.ne]: nik_admin_sa }
        }
      });
      const existingEmailUserUmum = await UserUmum.findOne({ where: { email } });
      const existingEmailAdminKategori = await AdminKategori.findOne({ where: { email } });
      const existingEmailPencatat = await Pencatat.findOne({ where: { email } });
      const existingEmailTeknisi = await Teknisi.findOne({ where: { email } });
      const existingEmailValidator = await Validator.findOne({ where: { email } });
      if (existingEmail || existingEmailUserUmum || existingEmailAdminKategori || existingEmailPencatat || existingEmailTeknisi || existingEmailValidator) {
        return res.status(409).json({ message: 'Email sudah digunakan. Gunakan email yang belum terdaftar' });
      }
    }

    // Update data
    const updateData = {};
    if (nama) updateData.nama = nama;
    if (nip_admin_sa) updateData.nip_admin_sa = nip_admin_sa;
    if (no_hp) updateData.no_hp = no_hp;
    if (email) updateData.email = email;
    if (alamat) updateData.alamat = alamat;

    await admin.update(updateData);

    res.status(200).json({
      message: 'Data admin SA berhasil diperbarui',
      data: admin
    });
  } catch (error) {
    console.error('Error update admin SA:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data admin SA', error: error.message });
  }
};

// 7. Hapus admin_sa saja (tanpa hapus akun)
const deleteAdminSA = async (req, res) => {
  const { nik_admin_sa } = req.params;

  // Validasi NIK admin_sa
  if (!nik_admin_sa || nik_admin_sa.length !== 16 || !/^\d+$/.test(nik_admin_sa)) {
    return res.status(400).json({ message: 'NIK admin SA harus terdiri dari 16 digit angka' });
  }

  try {
    const admin = await AdminSA.findByPk(nik_admin_sa);
    if (!admin) {
      return res.status(404).json({ message: 'Admin SA tidak ditemukan' });
    }

    await admin.destroy();

    res.status(200).json({ message: 'Data admin SA berhasil dihapus' });
  } catch (error) {
    console.error('Error delete admin SA:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus data admin SA', error: error.message });
  }
};

// 8. Statistik jumlah pengguna per role
const getStatistikPengguna = async (req, res) => {
  try {
    // Cek otoritas
    if (!(req.user.role === 'admin_sa' || req.user.role === 'admin_kategori')) {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin SA dan admin kategori yang dapat mengakses' });
    }

    const totalUser = await Akun.count();
    const totalUserUmum = await Akun.count({ where: { role: 'user_umum' } });
    const totalPencatat = await Akun.count({ where: { role: 'pencatat' } });
    const totalValidator = await Akun.count({ where: { role: 'validator' } });
    const totalAdminKategori = await Akun.count({ where: { role: 'admin_kategori' } });
    const totalTeknisi = await Akun.count({ where: { role: 'teknisi' } });
    const totalAdminSA = await Akun.count({ where: { role: 'admin_sa' } });

    res.status(200).json({
      message: 'Statistik pengguna berhasil diambil',
      data: {
        totalUser,
        totalUserUmum,
        totalPencatat,
        totalValidator,
        totalAdminKategori,
        totalTeknisi,
        totalAdminSA
      }
    });
  } catch (error) {
    console.error('Error get statistik pengguna:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil statistik pengguna',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetailByRole,
  deleteAkun,
  getMonitoringData,
  createUser,
  updateAdminSA,
  deleteAdminSA,
  getStatistikPengguna
};