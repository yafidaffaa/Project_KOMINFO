const bcrypt = require('bcrypt');
const Akun = require('../models/akun');
const AdminSA = require('../models/admin_sa');
const Pencatat = require('../models/pencatat');
const UserUmum = require('../models/user_umum');
const Validator = require('../models/validator');
const Teknisi = require('../models/teknisi');
const AdminKategori = require('../models/admin_kategori');
const BugReport = require('../models/bug_report');

// 1. Melihat semua user (akun)
const getAllUsers = async (req, res) => {
  try {
    const akun = await Akun.findAll({
      attributes: ['id_akun', 'username', 'role']
    });
    res.json(akun);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data akun', error: err.message });
  }
};

// 2. Detail user berdasarkan role
const getUserDetailByRole = async (req, res) => {
  const { role } = req.params;
  try {
    let data;
    switch (role) {
      case 'admin_sa':
        data = await AdminSA.findAll();
        break;
      case 'pencatat':
        data = await Pencatat.findAll();
        break;
      case 'user_umum':
        data = await UserUmum.findAll();
        break;
      case 'validator':
        data = await Validator.findAll();
        break;
      case 'teknisi':
        data = await Teknisi.findAll();
        break;
      case 'admin_kategori':
        data = await AdminKategori.findAll();
        break;
      default:
        return res.status(400).json({ message: 'Role tidak valid' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data user berdasarkan role', error: err.message });
  }
};

// 3. Hapus akun dan data profil terkait
const deleteAkun = async (req, res) => {
  const { id_akun } = req.params;
  try {
    const akun = await Akun.findByPk(id_akun);
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });

    // Hapus profil berdasarkan role
    const { role } = akun;

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

    await akun.destroy();

    res.json({ message: 'Akun dan data profil berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus akun', error: err.message });
  }
};

// 4. Monitoring dashboard: statistik bug dan user
const getMonitoringData = async (req, res) => {
  try {
    const totalBug = await BugReport.count();
    const bugSelesai = await BugReport.count({ where: { status: 'selesai' } });
    const bugBelumSelesai = await BugReport.count({
      where: { status: ['diajukan', 'diproses', 'revisi by admin'] }
    });

    const totalUser = await Akun.count();
    const totalPencatat = await Akun.count({ where: { role: 'pencatat' } });
    const totalTeknisi = await Akun.count({ where: { role: 'teknisi' } });
    const totalValidator = await Akun.count({ where: { role: 'validator' } });

    res.json({
      totalBug,
      bugSelesai,
      bugBelumSelesai,
      totalUser,
      totalPencatat,
      totalTeknisi,
      totalValidator
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data monitoring', error: err.message });
  }
};

// 5. Buat akun + data profil berdasarkan role
const createUser = async (req, res) => {
  const { username, password, role, ...profilData } = req.body;

  const allowedRoles = ['pencatat', 'validator', 'teknisi', 'admin_kategori', 'user_umum'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Role tidak diizinkan' });
  }

  try {
    const existing = await Akun.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'Username sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const akunBaru = await Akun.create({ username, password: hashedPassword, role });

    switch (role) {
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

    res.status(201).json({ message: 'User berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat user', error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserDetailByRole,
  deleteAkun,
  getMonitoringData,
  createUser
};
