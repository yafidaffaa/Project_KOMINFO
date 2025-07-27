const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const BugReport = require('./bug_report');
const Teknisi = require('./teknisi');
const Validator = require('./validator');

const BugAssign = sequelize.define('BugAssign', {
  id_assign: {
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
  nik_teknisi: {
    type: DataTypes.CHAR(18),
    allowNull: false,
    references: {
      model: Teknisi,
      key: 'nik_teknisi'
    }
  },
  modul_perbaikan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('diproses', 'selesai', 'pendapat selesai'),
    allowNull: false,
    defaultValue: 'diproses'
  },
  tanggal_assign: {
    type: DataTypes.DATE,
    allowNull: false
  },
  validasi_validator: {
    type: DataTypes.ENUM('disetujui', 'tidak disetujui'),
    allowNull: true
  },
  nik_validator: {
    type: DataTypes.CHAR(18),
    allowNull: false,
    references: {
      model: Validator,
      key: 'nik_validator'
    }
  }
}, {
  tableName: 'bug_assign',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relasi
BugAssign.belongsTo(BugReport, { foreignKey: 'id_bug_report' });
BugAssign.belongsTo(Teknisi, { foreignKey: 'nik_teknisi' });
BugAssign.belongsTo(Validator, { foreignKey: 'nik_validator' });

module.exports = BugAssign;
