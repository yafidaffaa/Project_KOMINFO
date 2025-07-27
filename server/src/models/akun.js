const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Akun = sequelize.define('Akun', {
  id_akun: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin_sa', 'admin_kategori', 'pencatat', 'validator', 'user_umum', 'teknisi'),
    allowNull: false
  }
}, {
  tableName: 'akun',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Akun;
