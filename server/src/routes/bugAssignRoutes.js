const express = require('express');
const router = express.Router();
const bugAssignController = require('../controllers/BugAssignController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Middleware global → semua endpoint butuh login
router.use(authMiddleware);

// ✅ Teknisi / Validator / Admin_sa → Lihat semua bug assign sesuai role
router.get(
  '/',
  roleMiddleware('teknisi', 'validator', 'admin_sa'),
  (req, res) => bugAssignController.getAllAssign(req, res)
);

// ✅ Lihat detail bug assign by ID
router.get(
  '/:id_bug_assign',
  roleMiddleware('teknisi', 'validator', 'admin_sa'),
  (req, res) => bugAssignController.getDetailAssign(req, res)
);

// ✅ Update bug assign (akses berbeda di-handle dalam controller)
router.put(
  '/:id_bug_assign',
  roleMiddleware('teknisi', 'validator', 'admin_sa'),
  (req, res) => bugAssignController.updateAssign(req, res)
);

// ✅ Admin_sa → Hapus bug assign
router.delete(
  '/:id_bug_assign',
  roleMiddleware('admin_sa'),
  (req, res) => bugAssignController.deleteAssign(req, res)
);

// 📌 GET statistik bug berdasarkan /bug-reports/statistik?tahun=2025

router.get(
  '/:tahun',
  roleMiddleware('teknisi', 'validator','admin_sa'),
  bugAssignController.getStatistikAssign
);

module.exports = router;
