// middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error('❌ Global Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan pada server',
  });
};
