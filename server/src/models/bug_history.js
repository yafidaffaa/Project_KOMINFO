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
  aksi: {
    type: DataTypes.STRING(255),
    allowNull: false
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
