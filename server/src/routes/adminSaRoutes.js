const express = require('express');
const router = express.Router();
const adminSaController = require('../controllers/AdminPusatController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Middleware global → semua endpoint butuh login
router.use(authMiddleware);

// Statistik pengguna - admin_sa DAN admin_kategori boleh akses
router.get('/dashboard-statistic', 
  roleMiddleware('admin_sa', 'admin_kategori'),
  adminSaController.getStatistikPengguna
);

// Monitoring dashboard (statistik umum) - hanya admin_sa
router.get('/dashboard', 
  roleMiddleware('admin_sa'),
  adminSaController.getMonitoringData
);

// Daftar semua akun di sistem - hanya admin_sa
router.get('/daftar-akun', 
  roleMiddleware('admin_sa'),
  adminSaController.getAllUsers
);

// Detail user berdasarkan role - hanya admin_sa
router.get('/user/role/:role', 
  roleMiddleware('admin_sa'),
  adminSaController.getUserDetailByRole
);

// Menghapus akun berdasarkan id_akun - hanya admin_sa
router.delete('/user/:id_akun', 
  roleMiddleware('admin_sa'),
  adminSaController.deleteAkun
);

// Membuat user baru - hanya admin_sa
router.post('/user', 
  roleMiddleware('admin_sa'),
  adminSaController.createUser
);

module.exports = router;