const express = require('express');
const router = express.Router();
const bugReportController = require('../controllers/BugReportController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

// 📌 Untuk user & pencatat — membuat & melihat laporan sendiri
router.post('/', roleMiddleware(['user', 'pencatat']), bugReportController.createBug);                 // ✅ createBug
router.get('/my-reports', roleMiddleware(['user', 'pencatat']), bugReportController.getBugsByUser);   // ✅ getBugsByUser
router.get('/my-reports/:id', roleMiddleware(['user', 'pencatat']), bugReportController.getBugById);   // ✅ getBugById

// 📌 Untuk validator — memfilter laporan berdasarkan layanan yang ditangani
router.get('/laporan', roleMiddleware(['validator']), bugReportController.getBugsByValidatorKategori); // ✅ getBugsByValidatorKategori
router.put('/laporan/:id/status', roleMiddleware(['validator']), bugReportController.updateStatus);    // ✅ updateStatus

module.exports = router;
