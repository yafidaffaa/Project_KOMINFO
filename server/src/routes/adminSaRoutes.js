const express = require('express');
const router = express.Router();
const adminSaController = require('../controllers/AdminPusatController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Middleware autentikasi dan role admin pusat (admin_sa)
router.use(authMiddleware);
router.use(roleMiddleware(['admin_sa']));

// Monitoring dashboard (statistik umum)
router.get('/dashboard', adminSaController.getMonitoringData);

// Daftar semua akun di sistem
router.get('/daftar-akun', adminSaController.getAllUsers);

// Detail user berdasarkan role (admin_sa, pencatat, user_umum, validator, teknisi, admin_kategori)
router.get('/user/role/:role', adminSaController.getUserDetailByRole);

// Menghapus akun berdasarkan id_akun
router.delete('/user/:id_akun', adminSaController.deleteAkun);

// Membuat user baru (akun + profil) berdasarkan role
router.post('/user', adminSaController.createUser);

module.exports = router;
