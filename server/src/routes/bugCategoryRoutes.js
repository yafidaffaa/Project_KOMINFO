const express = require('express');
const router = express.Router();

// Import controller
const kategoriLayananController = require('../controllers/KategoriLayananController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Middleware global → semua endpoint butuh login
router.use(authMiddleware);

// CREATE kategori layanan
router.post(
  '/',
  roleMiddleware('admin_sa', 'admin_kategori'),
  (req, res) => kategoriLayananController.createCategory(req, res)
);

// GET all kategori layanan
router.get(
  '/',
  roleMiddleware('admin_sa', 'admin_kategori', 'user_umum'),
  (req, res) => kategoriLayananController.getAllCategories(req, res)
);

// GET single kategori layanan by ID
router.get(
  '/:id_kategori',
  roleMiddleware('admin_sa', 'admin_kategori', 'user_umum'),
  (req, res) => kategoriLayananController.getCategoryById(req, res)
);

// UPDATE kategori layanan by ID
router.put(
  '/:id_kategori',
  roleMiddleware('admin_sa', 'admin_kategori'),
  (req, res) => kategoriLayananController.updateCategory(req, res)
);

// DELETE kategori layanan by ID
router.delete(
  '/:id_kategori',
  roleMiddleware('admin_sa', 'admin_kategori'),
  (req, res) => kategoriLayananController.deleteCategory(req, res)
);

// PATCH revisi laporan bug by admin kategori
router.patch(
  '/revisi/:id_laporan',
  roleMiddleware('admin_sa', 'admin_kategori'),
  (req, res) => kategoriLayananController.revisiBugReport(req, res)
);

module.exports = router;
