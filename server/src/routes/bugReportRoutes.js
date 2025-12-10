const express = require('express');
const router = express.Router();
const bugReportController = require('../controllers/BugReportController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Semua route butuh autentikasi
router.use(authMiddleware);

// CREATE laporan bug
router.post(
  '/',
  roleMiddleware('user_umum', 'pencatat', 'admin_sa'),
  upload.array('photos', 5),
  bugReportController.createBug
);

// GET semua bug (list sesuai role)
router.get(
  '/',
  roleMiddleware('user_umum', 'pencatat', 'validator', 'admin_kategori','admin_sa'),
  bugReportController.getBugs
);

// GET statistik bug berdasarkan /bug-reports/statistik?tahun=2025
router.get(
  '/statistik',
  roleMiddleware('user_umum', 'pencatat', 'validator','admin_sa'),
  bugReportController.getBugStatistics
);

// GET detail bug berdasarkan ID
router.get(
  '/:id',
  roleMiddleware('user_umum', 'pencatat', 'validator', 'admin_kategori','admin_sa'),
  bugReportController.getBugById
);

// UPDATE bug
router.put(
  '/:id',
  roleMiddleware('user_umum', 'pencatat', 'validator', 'admin_kategori', 'admin_sa'),
  upload.array('photos', 5),
  bugReportController.updateBug
);

// DELETE bug
router.delete(
  '/:id',
  roleMiddleware('admin_sa'),
  bugReportController.deleteBug
);

module.exports = router;
