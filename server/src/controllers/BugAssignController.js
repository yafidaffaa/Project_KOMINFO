const BugAssign = require('../models/bug_assign');
const BugReport = require('../models/bug_report');
const BugCategory = require('../models/bug_category');
const Teknisi = require('../models/teknisi');
const Validator = require('../models/validator');
const BugHistory = require('../models/bug_history');
const BugPhoto = require('../models/bug_photo');
const UserUmum = require('../models/user_umum');
const Pencatat = require('../models/pencatat');
const AdminSA = require('../models/admin_sa');
const { generateKeterangan } = require('../utils/bugHistoryHelper');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Helper untuk cek role
const isRole = (user, ...roles) => roles.includes(user.role);

// Mengambil semua bug assign
const getAllAssign = async (req, res) => {
  try {
    let whereClause = {};

    // Filter berdasarkan role
    if (isRole(req.user, 'validator')) {
      whereClause.nik_validator = req.user.nik_validator;
    } else if (isRole(req.user, 'teknisi')) {
      whereClause.nik_teknisi = req.user.nik_teknisi;
    } else if (!isRole(req.user, 'admin_sa')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const assigns = await BugAssign.findAll({
      where: whereClause,
      include: [
        {
          model: BugReport,
          attributes: ['id_bug_report', 'deskripsi', 'tanggal_laporan', 'status', 'photo_bug', 'nik_user', 'nik_pencatat', 'nik_admin_sa'],
          required: false,
          include: [
            { model: UserUmum, attributes: ['nama'], required: false },
            { model: Pencatat, attributes: ['nama'], required: false },
            { model: AdminSA, attributes: ['nama'], required: false }
          ]
        },
        {
          model: BugCategory,
          attributes: ['id_kategori', 'nama_layanan'],
          required: false
        },
        {
          model: Teknisi,
          attributes: ['nik_teknisi', 'nama'],
          required: false
        },
        {
          model: Validator,
          attributes: ['nik_validator', 'nama'],
          required: false
        }
      ],
      order: [['tanggal_penugasan', 'DESC']]
    });

    if (assigns.length === 0) {
      return res.status(200).json({
        message: 'Belum ada bug assign',
        data: []
      });
    }

    // Transform data dengan photo info
    const response = await Promise.all(assigns.map(async (assign) => {
      const assignJson = assign.toJSON();
      const bug = assign.BugReport;
      const namaPelapor = bug?.UserUmum?.nama || bug?.Pencatat?.nama || bug?.AdminSA?.nama || 'Tidak Diketahui';

      let photoInfo = {
        has_photo: bug?.photo_bug === 'ada',
        photo_count: 0,
        photo_endpoint: null,
        can_view_photos: false
      };

      // Jika ada foto, ambil detail foto
      if (bug?.photo_bug === 'ada') {
        const photoCount = await BugPhoto.count({
          where: { id_bug_report: bug.id_bug_report }
        });

        if (photoCount > 0) {
          photoInfo = {
            has_photo: true,
            photo_count: photoCount,
            photo_endpoint: `/bug-photos/bug-report/${bug.id_bug_report}`,
            can_view_photos: true
          };
        }
      }

      return {
        ...assignJson,
        nama_pelapor: namaPelapor,
        photo_info: photoInfo
      };
    }));

    res.status(200).json({
      message: 'Data bug assign berhasil diambil',
      total: response.length,
      data: response
    });
  } catch (error) {
    console.error('Error get all bug assign:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data bug assign',
      error: error.message
    });
  }
};

// Mengambil detail bug assign berdasarkan ID
const getDetailAssign = async (req, res) => {
  const { id_bug_assign } = req.params;

  // Validasi ID
  if (!id_bug_assign || isNaN(id_bug_assign)) {
    return res.status(400).json({ message: 'ID bug assign tidak valid' });
  }

  try {
    let whereClause = { id_bug_assign };

    // Filter berdasarkan role
    if (isRole(req.user, 'validator')) {
      whereClause.nik_validator = req.user.nik_validator;
    } else if (isRole(req.user, 'teknisi')) {
      whereClause.nik_teknisi = req.user.nik_teknisi;
    } else if (!isRole(req.user, 'admin_sa')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const assign = await BugAssign.findOne({
      where: whereClause,
      include: [
        {
          model: BugReport,
          attributes: ['id_bug_report', 'deskripsi', 'tanggal_laporan', 'status', 'photo_bug', 'nik_user', 'nik_pencatat', 'nik_admin_sa'],
          required: false,
          include: [
            { model: UserUmum, attributes: ['nama'], required: false },
            { model: Pencatat, attributes: ['nama'], required: false },
            { model: AdminSA, attributes: ['nama'], required: false }
          ]
        },
        {
          model: BugCategory,
          attributes: ['id_kategori', 'nama_layanan'],
          required: false
        },
        {
          model: Teknisi,
          attributes: ['nik_teknisi', 'nama', 'email'],
          required: false
        },
        {
          model: Validator,
          attributes: ['nik_validator', 'nama', 'email'],
          required: false
        }
      ]
    });

    if (!assign) {
      return res.status(404).json({ message: 'Bug assign tidak ditemukan' });
    }

    const bug = assign.BugReport;
    const namaPelapor = bug?.UserUmum?.nama || bug?.Pencatat?.nama || bug?.AdminSA?.nama || 'Tidak Diketahui';

    let photoInfo = {
      has_photo: bug?.photo_bug === 'ada',
      photo_count: 0,
      photo_endpoint: null,
      can_view_photos: false
    };

    // Jika ada foto, ambil detail foto
    if (bug?.photo_bug === 'ada') {
      const photoCount = await BugPhoto.count({
        where: { id_bug_report: bug.id_bug_report }
      });

      if (photoCount > 0) {
        photoInfo = {
          has_photo: true,
          photo_count: photoCount,
          photo_endpoint: `/bug-photos/bug-report/${bug.id_bug_report}`,
          can_view_photos: true
        };
      }
    }

    res.status(200).json({
      message: 'Detail bug assign berhasil diambil',
      data: {
        ...assign.toJSON(),
        nama_pelapor: namaPelapor,
        photo_info: photoInfo
      }
    });
  } catch (error) {
    console.error('Error get detail bug assign:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil detail bug assign',
      error: error.message
    });
  }
};

// Memperbarui bug assign
const updateAssign = async (req, res) => {
  const { id_bug_assign } = req.params;

  // Validasi ID
  if (!id_bug_assign || isNaN(id_bug_assign)) {
    return res.status(400).json({ message: 'ID bug assign tidak valid' });
  }

  const transaction = await sequelize.transaction();

  try {
    const assign = await BugAssign.findByPk(id_bug_assign, { transaction });

    if (!assign) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Bug assign tidak ditemukan' });
    }

    let updateData = {};
    let shouldCreateHistory = false;
    let historyStatus = '';
    let historyKeterangan = '';

    const updatedBy = req.user.nama || req.user.nama_lengkap || 'Unknown';

    // TEKNISI - Update catatan dan status
    if (isRole(req.user, 'teknisi')) {
      // Validasi ownership
      if (assign.nik_teknisi !== req.user.nik_teknisi) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Bug assign bukan milik Anda' });
      }

      const { catatan_teknisi, status } = req.body;

      // Validasi status
      if (status) {
        const validStatus = ['diproses', 'selesai', 'pendapat_selesai'];
        if (!validStatus.includes(status)) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Status tidak valid',
            valid_status: validStatus
          });
        }

        // Cek apakah status berubah
        if (status !== assign.status) {
          updateData.status = status;
          shouldCreateHistory = true;
          historyStatus = status;
          historyKeterangan = generateKeterangan(status, req.user);
        }
      }

      if (catatan_teknisi !== undefined) {
        updateData.catatan_teknisi = catatan_teknisi?.trim() || null;
      }

      updateData.updated_by = updatedBy;

    }
    // VALIDATOR - Update keterangan dan validasi
    else if (isRole(req.user, 'validator')) {
      // Validasi ownership
      if (assign.nik_validator !== req.user.nik_validator) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Bug assign bukan milik Anda' });
      }

      const { ket_validator, validasi_validator } = req.body;

      // Update keterangan validator
      if (ket_validator !== undefined) {
        updateData.ket_validator = ket_validator?.trim() || null;
      }

      // Update validasi validator
      if (validasi_validator !== undefined) {
        const validValidasi = ['disetujui', 'tidak_disetujui'];
        if (!validValidasi.includes(validasi_validator)) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Validasi tidak valid',
            valid_validasi: validValidasi
          });
        }

        updateData.validasi_validator = validasi_validator;
        shouldCreateHistory = true;
        historyStatus = validasi_validator;
        historyKeterangan = generateKeterangan(validasi_validator, req.user);

        // Update BugReport status berdasarkan validasi
        if (validasi_validator === 'disetujui') {
          await BugReport.update(
            { status: assign.status },
            {
              where: { id_bug_report: assign.id_bug_report },
              transaction
            }
          );
        } else if (validasi_validator === 'tidak_disetujui') {
          // Kembalikan status BugAssign ke diproses
          updateData.status = 'diproses';

          await BugReport.update(
            { status: 'diproses' },
            {
              where: { id_bug_report: assign.id_bug_report },
              transaction
            }
          );
        }
      }

      updateData.updated_by = updatedBy;

    }
    // ADMIN SA - Full control
    else if (isRole(req.user, 'admin_sa')) {
      const {
        id_bug_category,
        deskripsi,
        status,
        ket_validator,
        validasi_validator,
        catatan_teknisi
      } = req.body;

      // Validasi kategori jika diubah
      if (id_bug_category && id_bug_category !== assign.id_bug_category) {
        const category = await BugCategory.findByPk(id_bug_category, { transaction });
        if (!category) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Kategori bug tidak ditemukan' });
        }
        updateData.id_bug_category = id_bug_category;
      }

      // Validasi status jika diubah
      if (status) {
        const validStatus = ['diproses', 'selesai', 'pendapat_selesai'];
        if (!validStatus.includes(status)) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Status tidak valid',
            valid_status: validStatus
          });
        }
        updateData.status = status;
      }

      // Validasi validasi_validator jika diubah
      if (validasi_validator) {
        const validValidasi = ['disetujui', 'tidak_disetujui'];
        if (!validValidasi.includes(validasi_validator)) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Validasi tidak valid',
            valid_validasi: validValidasi
          });
        }
        updateData.validasi_validator = validasi_validator;
      }

      if (deskripsi !== undefined) updateData.deskripsi = deskripsi?.trim() || null;
      if (ket_validator !== undefined) updateData.ket_validator = ket_validator?.trim() || null;
      if (catatan_teknisi !== undefined) updateData.catatan_teknisi = catatan_teknisi?.trim() || null;

      updateData.updated_by = updatedBy;

      shouldCreateHistory = true;
      historyStatus = 'Admin_sa melakukan update bug assign';
      historyKeterangan = generateKeterangan('Admin_sa melakukan update bug assign', req.user);

    } else {
      await transaction.rollback();
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Cek apakah ada perubahan
    const hasChanges = Object.keys(updateData).length > 0;
    if (!hasChanges) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Tidak ada data yang diperbarui' });
    }

    // Update bug assign
    await assign.update(updateData, { transaction });

    // Catat history jika diperlukan
    if (shouldCreateHistory && assign.id_bug_report) {
      await BugHistory.create({
        id_bug_report: assign.id_bug_report,
        id_akun: req.user.id_akun,
        status: historyStatus,
        keterangan: historyKeterangan,
        tanggal: new Date()
      }, { transaction });
    }

    await transaction.commit();

    // Ambil data lengkap
    const updatedAssign = await BugAssign.findByPk(id_bug_assign, {
      include: [
        {
          model: BugCategory,
          attributes: ['id_kategori', 'nama_layanan']
        },
        {
          model: Teknisi,
          attributes: ['nik_teknisi', 'nama']
        },
        {
          model: Validator,
          attributes: ['nik_validator', 'nama']
        }
      ]
    });

    res.status(200).json({
      message: 'Bug assign berhasil diperbarui',
      data: updatedAssign
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error update bug assign:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui bug assign',
      error: error.message
    });
  }
};

// Menghapus bug assign (hanya admin_sa)
const deleteAssign = async (req, res) => {
  const { id_bug_assign } = req.params;

  // Validasi role
  if (!isRole(req.user, 'admin_sa')) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  // Validasi ID
  if (!id_bug_assign || isNaN(id_bug_assign)) {
    return res.status(400).json({ message: 'ID bug assign tidak valid' });
  }

  const transaction = await sequelize.transaction();

  try {
    const assign = await BugAssign.findByPk(id_bug_assign, { transaction });

    if (!assign) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Bug assign tidak ditemukan' });
    }

    const id_bug_report = assign.id_bug_report;

    // Update status BugReport kembali ke diajukan
    await BugReport.update(
      { status: 'diajukan' },
      {
        where: { id_bug_report },
        transaction
      }
    );

    // Hapus bug assign
    await assign.destroy({ transaction });

    // Catat history penghapusan
    await BugHistory.create({
      id_bug_report,
      id_akun: req.user.id_akun,
      status: 'Bug assign dihapus admin_sa',
      keterangan: generateKeterangan('Bug assign dihapus admin_sa', req.user),
      tanggal: new Date()
    }, { transaction });

    await transaction.commit();

    res.status(200).json({ message: 'Bug assign berhasil dihapus' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error delete bug assign:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menghapus bug assign',
      error: error.message
    });
  }
};

// Mengambil statistik bug assign
const getStatistikAssign = async (req, res) => {
  let { tahun } = req.query;

  // Validasi tahun
  if (tahun && (isNaN(tahun) || tahun < 2000 || tahun > 2100)) {
    return res.status(400).json({ message: 'Tahun tidak valid' });
  }

  if (!tahun) {
    tahun = new Date().getFullYear();
  }

  try {
    // Range tanggal dengan UTC
    const startDate = new Date(`${tahun}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${tahun}-12-31T23:59:59.999Z`);

    // Filter dasar
    const whereCondition = {
      tanggal_penugasan: {
        [Op.between]: [startDate, endDate],
      },
    };

    // Filter sesuai role
    if (isRole(req.user, 'teknisi')) {
      whereCondition.nik_teknisi = req.user.nik_teknisi;
    } else if (isRole(req.user, 'validator')) {
      whereCondition.nik_validator = req.user.nik_validator;
    } else if (!isRole(req.user, 'admin_sa')) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Hitung statistik
    const [total, diproses, selesai, pendapatSelesai] = await Promise.all([
      BugAssign.count({ where: whereCondition }),
      BugAssign.count({ where: { ...whereCondition, status: 'diproses' } }),
      BugAssign.count({ where: { ...whereCondition, status: 'selesai' } }),
      BugAssign.count({ where: { ...whereCondition, status: 'pendapat_selesai' } })
    ]);

    res.status(200).json({
      message: 'Statistik bug assign berhasil diambil',
      data: {
        tahun: parseInt(tahun),
        total,
        diproses,
        selesai,
        pendapat_selesai: pendapatSelesai
      }
    });
  } catch (error) {
    console.error('Error get statistik bug assign:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil statistik bug assign',
      error: error.message
    });
  }
};

module.exports = {
  getAllAssign,
  getDetailAssign,
  updateAssign,
  deleteAssign,
  getStatistikAssign
};