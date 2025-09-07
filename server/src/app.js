require('dotenv').config(); // HARUS paling atas

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

const app = express();

// 🧾 Logging
app.use(morgan('dev'));

// 🌐 CORS Configuration
const allowedOrigins = [
  `http://${process.env.IP_FE}`,
  `http://${process.env.HOST}:3000`,
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
const bugPhotoRoutes = require('./routes/bugPhotoRoutes');

const supabase = require('./config/supabase');

// 🗃️ Sequelize & Models
const sequelize = require('./config/db');
const Akun = require('./models/akun');
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
require('./models/bug_photo');

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
app.use('/bug-photos', authMiddleware, bugPhotoRoutes);

console.log('Supabase bucket:', process.env.SUPABASE_BUCKET);

console.log('📦 Semua route berhasil dimuat.');

// ⚙️ Sync Database & Seed Admin SA
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Database synced');

    const AdminSA = require('./models/admin_sa');

    // 🔹 Cek akun
    let admin = await Akun.findOne({ where: { username: process.env.ADMIN_SA_USERNAME } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_SA_PASSWORD, 10);

      // 1. Buat akun
      admin = await Akun.create({
        username: process.env.ADMIN_SA_USERNAME,
        password: hashedPassword,
        role: 'admin_sa' // pastikan role sama kayak yang dipakai sistem
      });

      // 2. Buat profil AdminSA
      await AdminSA.create({
        nik_admin_sa: '1234567890123456',
        nama: 'Super Admin',
        no_hp: '081234567890',
        email: 'adminsa@example.com',
        alamat: 'Jl. Contoh No.1',
        nip_admin_sa: '123456789012345678',
        id_akun: admin.id_akun
      });

      console.log('✅ Admin SA + profil dibuat otomatis');
    } else {
      console.log('ℹ️ Admin SA sudah ada, skip seeding');
    }
  })
  .catch(err => console.error('❌ Failed to sync DB:', err));

module.exports = app;
