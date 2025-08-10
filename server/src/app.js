require('dotenv').config(); // HARUS paling atas

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// 🧾 Logging
app.use(morgan('dev'));

// 🌐 CORS Configuration
const allowedOrigins = [
  `http://${process.env.IP_FE}`,
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS request from:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// 🔐 IP Filtering Middleware
const ipFilter = require('./middlewares/ipFilter');
app.use(ipFilter);

// 🧩 Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔒 Auth Middleware
const authMiddleware = require('./middlewares/authMiddleware');

// 📦 Route Imports
const authRoutes = require('./routes/authRoutes');
const adminSaRoutes = require('./routes/adminSaRoutes');
const adminKategoriRoutes = require('./routes/adminKategoriRoutes');
const userUmumRoutes = require('./routes/userUmumRoutes');
const pencatatRoutes = require('./routes/pencatatRoutes');
const validatorRoutes = require('./routes/validatorRoutes');
const teknisiRoutes = require('./routes/teknisiRoutes');
const bugCategoryRoutes = require('./routes/bugCategoryRoutes');
const bugReportRoutes = require('./routes/bugReportRoutes');
const bugAssignRoutes = require('./routes/bugAssignRoutes');
const bugHistoryRoutes = require('./routes/bugHistoryRoutes');

// 🗃️ Sequelize & Models
const sequelize = require('./config/db');
require('./models/akun');
require('./models/admin_sa');
require('./models/validator');
require('./models/user_umum');
require('./models/pencatat');
require('./models/teknisi');
require('./models/admin_kategori');
require('./models/bug_category');
require('./models/bug_report');
require('./models/bug_assign');
require('./models/bug_history');

// 📢 Load Routes
app.use('/auth', authRoutes);
app.use('/admin-sa', authMiddleware, adminSaRoutes);
app.use('/admin-kategori', authMiddleware, adminKategoriRoutes);
app.use('/user-umum', authMiddleware, userUmumRoutes);
app.use('/pencatat', authMiddleware, pencatatRoutes);
app.use('/validator', authMiddleware, validatorRoutes);
app.use('/teknisi', authMiddleware, teknisiRoutes);
app.use('/bug-category', authMiddleware, bugCategoryRoutes);
app.use('/bug-report', authMiddleware, bugReportRoutes);
app.use('/bug-assign', authMiddleware, bugAssignRoutes);
app.use('/bug-history', authMiddleware, bugHistoryRoutes);

console.log('📦 Semua route berhasil dimuat.');

// ⚙️ Sync Database
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synced'))
  .catch(err => console.error('❌ Failed to sync DB:', err));

module.exports = app;
