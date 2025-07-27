const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Akun = require('./akun');
const Validator = require('./validator');

const Teknisi = sequelize.define('Teknisi', {
  nik_teknisi: {
    type: DataTypes.CHAR(16),
    primaryKey: true,
    allowNull: false
  },
  nama: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  no_hp: {
    type: DataTypes.CHAR(13),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  alamat: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nip_teknisi: {
    type: DataTypes.CHAR(18),
    allowNull: false  // WAJIB karena teknisi adalah pegawai pemerintah
  },
  id_akun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Akun,
      key: 'id_akun'
    }
  },
  nik_validator: {
    type: DataTypes.CHAR(16),
    allowNull: false,
    references: {
      model: Validator,
      key: 'nik_validator'
    }
  }
}, {
  tableName: 'teknisi',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Teknisi.belongsTo(Akun, { foreignKey: 'id_akun' });
Teknisi.belongsTo(Validator, { foreignKey: 'nik_validator' });

module.exports = Teknisi;
