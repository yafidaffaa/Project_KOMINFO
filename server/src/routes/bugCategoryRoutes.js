const express = require('express');
const router = express.Router();
const bugCategoryController = require('../controllers/KategoriLayananController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Middleware: hanya admin_kategori yang bisa akses semua route ini
router.use(authMiddleware);
router.use(roleMiddleware(['admin_kategori']));

// 📌 CRUD Bug Category (Jenis Layanan)
router.get('/', bugCategoryController.getAllCategories);               // ✅ Ambil semua kategori
router.get('/:id_kategori', bugCategoryController.getCategoryById);   // ✅ Ambil detail kategori
router.post('/', bugCategoryController.createCategory);               // ✅ Tambah kategori baru
router.put('/:id_kategori', bugCategoryController.updateCategory);    // ✅ Edit kategori
router.delete('/:id_kategori', bugCategoryController.deleteCategory); // ✅ Hapus kategori

// 📌 Update kategori bug report (revisi)
router.put('/revisi/:id_bug_report', bugCategoryController.updateLaporanKategori); // ✅ Ganti kategori bug report

module.exports = router;
