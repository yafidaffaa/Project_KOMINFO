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
  judul: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tanggal_lapor: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('diajukan', 'diproses', 'revisi by admin', 'selesai', 'dianggap selesai'),
    allowNull: false,
    defaultValue: 'diajukan'
  },
  id_kategori: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BugCategory,
      key: 'id_kategori'
    }
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
    type: DataTypes.CHAR(18),
    allowNull: true,
    references: {
      model: Pencatat,
      key: 'nik_pencatat'
    }
  }
}, {
  tableName: 'bug_report',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relasi
BugReport.belongsTo(BugCategory, { foreignKey: 'id_kategori' });
BugReport.belongsTo(UserUmum, { foreignKey: 'nik_user' });
BugReport.belongsTo(Pencatat, { foreignKey: 'nik_pencatat' });

module.exports = BugReport;
