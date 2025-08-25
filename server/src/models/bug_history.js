const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const BugReport = require('./bug_report');
const Akun = require('./akun');

const BugHistory = sequelize.define('BugHistory', {
  id_history: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_bug_report: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BugReport,
      key: 'id_bug_report'
    }
  },
  id_akun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Akun,
      key: 'id_akun'
    }
  },
  status: {
    // ENUM supaya konsisten (bisa ditambah jika ada status baru)
    type: DataTypes.ENUM(
      'dibuat',
      'diajukan',
      'diproses',
      'revisi_by_admin',
      'selesai',
      'pendapat_selesai',
      'disetujui',
      'tidak_disetujui'
    ),
    allowNull: false
  },
  keterangan: {
    // Opsional, untuk menambah detail aksi (misalnya alasan revisi, catatan teknisi, dll.)
    type: DataTypes.TEXT,
    allowNull: true
  },
  tanggal: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'bug_history',
  timestamps: false
});

// Relasi
BugHistory.belongsTo(BugReport, { foreignKey: 'id_bug_report' });
BugHistory.belongsTo(Akun, { foreignKey: 'id_akun' });

module.exports = BugHistory;
