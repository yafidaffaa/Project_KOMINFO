const express = require('express');
const router = express.Router();
const bugReportController = require('../controllers/BugReportController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Semua route butuh autentikasi
router.use(authMiddleware);

// 📌 CREATE laporan bug
router.post(
  '/',
  roleMiddleware('user_umum', 'pencatat', 'admin_sa'),
  bugReportController.createBug
);

// 📌 GET semua bug (list sesuai role)
router.get(
  '/',
  roleMiddleware('user_umum', 'pencatat', 'validator', 'admin_kategori','admin_sa'),
  bugReportController.getBugs
);

// 📌 GET detail bug berdasarkan ID
router.get(
  '/:id',
  roleMiddleware('user_umum', 'pencatat', 'validator', 'admin_kategori','admin_sa'),
  bugReportController.getBugById
);

// 📌 GET foto bug utama
// router.get(
//   '/:id/photo',
//   roleMiddleware('user_umum', 'pencatat', 'validator', 'admin_sa'),
//   bugReportController.getBugPhoto
// );

// 📌 UPDATE bug
router.put(
  '/:id',
  roleMiddleware('user_umum', 'pencatat', 'validator', 'admin_kategori', 'admin_sa'),
  bugReportController.updateBug
);

// 📌 DELETE bug
router.delete(
  '/:id',
  roleMiddleware('admin_sa'),
  bugReportController.deleteBug
);


module.exports = router;
