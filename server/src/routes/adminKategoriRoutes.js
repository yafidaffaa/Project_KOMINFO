const express = require('express');
const router = express.Router();
const adminKategoriController = require('../controllers/AdminKategoriController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('admin_sa', 'admin_kategori'));

router.get('/', adminKategoriController.getAllAdminKategori);
router.get('/:nik', adminKategoriController.getAdminKategoriById);
router.post('/', adminKategoriController.createAdminKategori);
router.put('/:nik', adminKategoriController.updateAdminKategori);
router.delete('/:nik', adminKategoriController.deleteAdminKategori);

module.exports = router;
