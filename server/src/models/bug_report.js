const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const BugCategory = require('./bug_category');
const UserUmum = require('./user_umum');
const Pencatat = require('./pencatat');

const BugReport = sequelize.define('BugReport', {
  id_bug_report: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_bug_category: { // disamakan dengan DB
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BugCategory,
      key: 'id_kategori'
    }
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tanggal_laporan: { // disamakan dengan DB
    type: DataTypes.DATE,
    allowNull: false
  },
  nik_user: {
    type: DataTypes.CHAR(16),
    allowNull: true,
    references: {
      model: UserUmum,
      key: 'nik_user'
    }
  },
  nik_pencatat: {
    type: DataTypes.CHAR(16), // disamakan dengan DB
    allowNull: true,
    references: {
      model: Pencatat,
      key: 'nik_pencatat'
    }
  },
  status: {
    type: DataTypes.ENUM('diajukan', 'diproses', 'revisi_by_admin', 'selesai', 'pendapat_selesai'),
    allowNull: false,
    defaultValue: 'diajukan'
  },
  photo_bug: {
    type: DataTypes.BLOB('long'),
    allowNull: true
  },
  ket_validator: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bug_report',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relasi
BugReport.belongsTo(BugCategory, { foreignKey: 'id_bug_category' });
BugReport.belongsTo(UserUmum, { foreignKey: 'nik_user' });
BugReport.belongsTo(Pencatat, { foreignKey: 'nik_pencatat' });

module.exports = BugReport;
