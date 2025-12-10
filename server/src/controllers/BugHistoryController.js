const BugHistory = require('../models/bug_history');
const BugReport = require('../models/bug_report');
const Akun = require('../models/akun');

// Mengambil timeline bug report berdasarkan ID
const getTimelineByBugId = async (req, res) => {
  const { id_bug_report } = req.params;

  // Validasi ID bug report
  if (!id_bug_report || isNaN(id_bug_report)) {
    return res.status(400).json({ message: 'ID bug report tidak valid' });
  }

  try {
    // Cek apakah bug report ada
    const bug = await BugReport.findByPk(id_bug_report);
    if (!bug) {
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

    // Ambil timeline history
    const timeline = await BugHistory.findAll({
      where: { id_bug_report },
      include: [
        {
          model: Akun,
          attributes: ['id_akun', 'username', 'role']
        }
      ],
      order: [['tanggal', 'ASC']]
    });

    // Cek apakah ada timeline
    if (timeline.length === 0) {
      return res.status(200).json({ 
        message: 'Belum ada timeline untuk bug report ini',
        data: {
          bug,
          timeline: []
        }
      });
    }

    res.status(200).json({ 
      message: 'Timeline bug report berhasil diambil',
      data: {
        bug,
        total_history: timeline.length,
        timeline
      }
    });
  } catch (error) {
    console.error('Error get timeline by bug id:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil timeline bug report', 
      error: error.message 
    });
  }
};

// Menambahkan history baru (optional - untuk konsistensi CRUD)
const createBugHistory = async (req, res) => {
  const { id_bug_report, id_akun, status, keterangan } = req.body;

  // Validasi field wajib
  if (!id_bug_report || !id_akun || !status) {
    return res.status(400).json({ 
      message: 'ID bug report, ID akun, dan status wajib diisi' 
    });
  }

  // Validasi status
  const validStatus = [
    'dibuat',
    'diajukan',
    'diproses',
    'revisi_by_admin',
    'selesai',
    'pendapat_selesai',
    'disetujui',
    'tidak_disetujui',
    'Bug assign dihapus admin_sa',
    'Admin_sa melakukan update bug assign'
  ];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ 
      message: 'Status tidak valid',
      valid_status: validStatus
    });
  }

  try {
    // Cek apakah bug report ada
    const bug = await BugReport.findByPk(id_bug_report);
    if (!bug) {
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

    // Cek apakah akun ada
    const akun = await Akun.findByPk(id_akun);
    if (!akun) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' });
    }

    // Buat history baru
    const history = await BugHistory.create({
      id_bug_report,
      id_akun,
      status,
      keterangan: keterangan || null,
      tanggal: new Date()
    });

    // Ambil data lengkap dengan relasi
    const newHistory = await BugHistory.findByPk(history.id_history, {
      include: [
        {
          model: Akun,
          attributes: ['id_akun', 'username', 'role']
        }
      ]
    });

    res.status(201).json({ 
      message: 'History bug report berhasil ditambahkan',
      data: newHistory
    });
  } catch (error) {
    console.error('Error create bug history:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menambahkan history bug report', 
      error: error.message 
    });
  }
};

// Mengambil semua history
const getAllBugHistory = async (req, res) => {
  try {
    const histories = await BugHistory.findAll({
      include: [
        {
          model: BugReport,
          attributes: ['id_bug_report', 'judul', 'status_bug']
        },
        {
          model: Akun,
          attributes: ['id_akun', 'username', 'role']
        }
      ],
      order: [['tanggal', 'DESC']]
    });

    if (histories.length === 0) {
      return res.status(200).json({ 
        message: 'Belum ada data history bug report', 
        data: [] 
      });
    }

    res.status(200).json({ 
      message: 'Data history bug report berhasil diambil',
      total: histories.length,
      data: histories 
    });
  } catch (error) {
    console.error('Error get all bug history:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil data history bug report', 
      error: error.message 
    });
  }
};

// Menghapus history (optional - jika diperlukan)
const deleteBugHistory = async (req, res) => {
  const { id_history } = req.params;

  // Validasi ID history
  if (!id_history || isNaN(id_history)) {
    return res.status(400).json({ message: 'ID history tidak valid' });
  }

  try {
    const history = await BugHistory.findByPk(id_history);

    if (!history) {
      return res.status(404).json({ message: 'History tidak ditemukan' });
    }

    await BugHistory.destroy({ where: { id_history } });

    res.status(200).json({ message: 'History bug report berhasil dihapus' });
  } catch (error) {
    console.error('Error delete bug history:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menghapus history bug report', 
      error: error.message 
    });
  }
};

module.exports = {
  getTimelineByBugId,
  createBugHistory,
  getAllBugHistory,
  deleteBugHistory
};