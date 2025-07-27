const express = require('express');
const router = express.Router();
const bugHistoryController = require('../controllers/BugHistoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware: semua user yang sudah login bisa lihat timeline
router.use(authMiddleware);

// 📌 GET timeline histori bug berdasarkan ID bug
router.get('/:id_bug_report', bugHistoryController.getTimelineByBugId); // ✅ nama function cocok

module.exports = router;