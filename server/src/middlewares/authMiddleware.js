const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header tidak valid atau tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
    req.user = decoded;
    // console.log('✅ Authenticated user:', decoded); // Uncomment saat debugging
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};

module.exports = authMiddleware;
