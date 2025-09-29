const BugHistory = require('../models/bug_history');
const BugReport = require('../models/bug_report');
const Akun = require('../models/akun');

const getTimelineByBugId = async (req, res) => {
  const { id_bug_report } = req.params;

  try {
    const bug = await BugReport.findByPk(id_bug_report);
    if (!bug) {
      return res.status(404).json({ message: 'Bug report tidak ditemukan' });
    }

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

    res.json({ bug, timeline });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data timeline', error: error.message });
  }
};

module.exports = { getTimelineByBugId };
