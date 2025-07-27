// const allowedIP = [process.env.IP_FE, process.env.HOST];

// module.exports = (req, res, next) => {
//   const ip = req.connection.remoteAddress.replace('::ffff:', '');
//   if (allowedIP.includes(ip)) {
//     next();
//   } else {
//     res.status(403).json({ message: 'Akses dari IP tidak diizinkan', ip });
//   }
// };

// middlewares/ipFilter.js
const allowedIP = [process.env.IP_FE, process.env.HOST];

module.exports = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const cleanIP = ip.replace('::ffff:', '');

  if (!allowedIP.includes(cleanIP)) {
    return res.status(403).json({ message: 'Akses dari IP tidak diizinkan', ip: cleanIP });
  }

  next();
};
