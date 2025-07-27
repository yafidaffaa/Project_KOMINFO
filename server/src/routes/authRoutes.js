const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// POST /auth/login → login user (semua role)
router.post('/login', authController.login);

// POST /auth/register → registrasi user umum (user_umum)
router.post('/register', authController.register);

module.exports = router;
