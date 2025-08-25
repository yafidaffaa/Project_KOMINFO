const express = require('express');
const router = express.Router();
const userUmumController = require('../controllers/UserUmumController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Middleware: hanya admin pusat bisa kelola user umum
router.use(authMiddleware);
router.use(roleMiddleware('admin_sa', 'admin_kategori'));

// 📌 CRUD User Umum
router.post('/', userUmumController.createUserUmum);          // Tambah user umum
router.get('/', userUmumController.getAllUserUmum);           // Semua user umum
router.get('/:nik', userUmumController.getUserUmumById);      // Detail user umum
router.put('/:nik', userUmumController.updateUserUmum);       // Update user umum
router.delete('/:nik', userUmumController.deleteUserUmum);    // Hapus user umum

module.exports = router;
