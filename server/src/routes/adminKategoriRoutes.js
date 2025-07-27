const express = require('express');
const router = express.Router();
const adminKategoriController = require('../controllers/AdminKategoriController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin_kategori']));

router.get('/layanan', adminKategoriController.getAllLayanan);
router.get('/layanan/:id', adminKategoriController.getLayananById);
router.post('/layanan', adminKategoriController.createLayanan);
router.put('/layanan/:id', adminKategoriController.updateLayanan);
router.delete('/layanan/:id', adminKategoriController.deleteLayanan);

router.put('/revisi-layanan/:id', adminKategoriController.revisiLayanan);

module.exports = router;
