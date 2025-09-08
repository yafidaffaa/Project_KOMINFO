const express = require('express');
const router = express.Router();
const pencatatController = require('../controllers/PencatatController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Middleware: hanya untuk admin (misalnya untuk kelola data pencatat)
router.use(authMiddleware);
router.use(roleMiddleware('admin_sa','admin_kategori'));

// CRUD pencatat
router.post('/', pencatatController.createPencatat);               // buat pencatat baru
router.get('/', pencatatController.getAllPencatat);                // ambil semua pencatat
router.get('/:nik', pencatatController.getPencatatById);           // ambil pencatat berdasarkan NIK
router.put('/:nik', pencatatController.updatePencatat);            // update data pencatat
router.delete('/:nik', pencatatController.deletePencatat);         // hapus pencatat + akun

module.exports = router;
