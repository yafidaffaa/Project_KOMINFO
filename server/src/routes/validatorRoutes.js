const express = require('express');
const router = express.Router();
const validatorController = require('../controllers/ValidatorController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Middleware hanya untuk admin pusat
router.use(authMiddleware);
router.use(roleMiddleware('admin_sa', 'admin_kategori'));

// CRUD Validator
router.post('/', validatorController.createValidator);             // Tambah validator
router.get('/', validatorController.getAllValidator);              // Semua validator
router.get('/:nik', validatorController.getValidatorById);         // Detail validator
router.put('/:nik', validatorController.updateValidator);          // Update validator
router.delete('/:nik', validatorController.deleteValidator);       // Hapus validator

module.exports = router;
