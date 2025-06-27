const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/db');
const ipFilter = require('./middlewares/ipFilter');
require('./models/akun');
require('./models/admin');
require('./models/pic');
require('./models/user');
require('./models/bawang');

app.use(ipFilter);

app.use(express.json()); // ⬅️ HARUS SEBELUM app.use('/auth')
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/auth', authRoutes);
console.log('📦 Memuat authRoutes dari:', require.resolve('./routes/authRoutes'));

// Sync DB
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synced'))
  .catch(err => console.error('❌ Failed to sync DB:', err));

module.exports = app;
