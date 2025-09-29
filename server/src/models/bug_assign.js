const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const BugReport = require('./bug_report');
const BugCategory = require('./bug_category');
const Teknisi = require('./teknisi');
const Validator = require('./validator');

const BugAssign = sequelize.define('BugAssign', {
  id_bug_assign: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_bug_category: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BugCategory,
      key: 'id_kategori'
    }
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photo_bug: {
  type: DataTypes.ENUM('ada', 'tidak ada'),
  allowNull: false,
},
  tanggal_penugasan: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('diproses', 'selesai', 'pendapat_selesai'),
    allowNull: false,
    defaultValue: 'diproses'
  },
  id_bug_report: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BugReport,
      key: 'id_bug_report'
    }
  },
  nama_pelapor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ket_validator: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  validasi_validator: {
    type: DataTypes.ENUM('disetujui', 'tidak_disetujui'),
    allowNull: true
  },
  catatan_teknisi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nik_teknisi: {
    type: DataTypes.CHAR(18),
    allowNull: false,
    references: {
      model: Teknisi,
      key: 'nik_teknisi'
    }
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
BugAssign.belongsTo(BugCategory, { foreignKey: 'id_bug_category' });
BugAssign.belongsTo(BugReport, { foreignKey: 'id_bug_report' });
BugAssign.belongsTo(Teknisi, { foreignKey: 'nik_teknisi' });
BugAssign.belongsTo(Validator, { foreignKey: 'nik_validator' });

module.exports = BugAssign;
