const express = require('express');
const router = express.Router();

// Import controller
const kategoriLayananController = require('../controllers/KategoriLayananController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');


// Middleware: hanya untuk admin
router.use(authMiddleware);
router.use(roleMiddleware('admin_sa', 'admin_kategori'));

// CREATE kategori layanan
router.post('/', kategoriLayananController.createCategory);

// GET all kategori layanan
router.get('/', kategoriLayananController.getAllCategories);

// GET single kategori layanan by ID
router.get('/:id_kategori', kategoriLayananController.getCategoryById);

// UPDATE kategori layanan by ID
router.put('/:id_kategori', kategoriLayananController.updateCategory);

// DELETE kategori layanan by ID
router.delete('/:id_kategori', kategoriLayananController.deleteCategory);

// PATCH revisi laporan bug by admin kategori
router.patch('/revisi/:id_laporan', kategoriLayananController.revisiBugReport);

module.exports = router;
