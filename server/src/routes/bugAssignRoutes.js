const express = require('express');
const router = express.Router();
const bugAssignController = require('../controllers/BugAssignController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

// Validator → Assign bug ke teknisi (pastikan controller ada fungsi createAssign)
router.post('/', roleMiddleware(['validator']), bugAssignController.createAssign);

// Teknisi → Lihat bug yang ditugaskan ke dirinya
router.get('/', roleMiddleware(['teknisi']), bugAssignController.getAllForTeknisi);

// (Kalau ada detail assign, pastikan controller ada getDetailAssignByTeknisi)
router.get('/:id_assign', roleMiddleware(['teknisi']), bugAssignController.getDetailAssignByTeknisi);

// Update oleh teknisi (status & modul perbaikan)
router.put('/:id_assign', roleMiddleware(['teknisi']), bugAssignController.updateByTeknisi);

// Validator → Validasi hasil pekerjaan teknisi
router.put('/:id_assign/validasi', roleMiddleware(['validator']), bugAssignController.validasiByValidator);

module.exports = router;
