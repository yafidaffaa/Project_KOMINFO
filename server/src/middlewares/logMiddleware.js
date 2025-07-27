// middlewares/logMiddleware.js
module.exports = (req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};
