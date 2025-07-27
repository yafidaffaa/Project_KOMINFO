const express = require('express');
const router = express.Router();
const teknisiController = require('../controllers/TeknisiController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Middleware: hanya untuk admin
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// 📌 CRUD Teknisi
router.post('/', teknisiController.createTeknisi);               // Tambah teknisi
router.get('/', teknisiController.getAllTeknisi);                // Semua teknisi
router.get('/:nik', teknisiController.getTeknisiById);           // Detail teknisi by NIK
router.put('/:nik', teknisiController.updateTeknisi);            // Update teknisi
router.delete('/:nik', teknisiController.deleteTeknisi);         // Hapus teknisi

module.exports = router;
