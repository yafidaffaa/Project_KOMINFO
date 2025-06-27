const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route login
router.post('/login', login);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the authentication API' });
});

// Route contoh yang butuh autentikasi
router.get('/profile', authMiddleware, (req, res) => {
  // req.user berisi data dari token
  res.json({ message: 'Ini data profil protected', user: req.user });
});

router.post('/api/login', (req, res) => {
  console.log(req.body);
  res.json({ message: 'Login received', data: req.body });
});



module.exports = router;
