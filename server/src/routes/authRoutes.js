const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /auth/login → login user (semua role)
router.post('/login', authController.login);

// POST /auth/register → registrasi user umum (user_umum)
router.post('/register', authController.register);

// POST /auth/forgot-password → request reset password (kirim email reset)
router.post('/forgot-password', authController.forgotPassword);

// POST /auth/reset-password → reset password dengan token yang valid
router.post('/reset-password', authController.resetPassword);

// tampilan form reset password (bisa diakses via link di email)
router.get('/reset-password', (req, res) => {
  const { token } = req.query;
  res.send(`
    <form action="/auth/reset-password" method="POST">
      <input type="hidden" name="token" value="${token}" />
      <label>Password Baru:</label>
      <input type="password" name="passwordBaru" />
      <button type="submit">Reset</button>
    </form>
  `);
});


module.exports = router;
