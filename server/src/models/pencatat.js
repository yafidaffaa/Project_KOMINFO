const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Akun = require('./akun');

const Pencatat = sequelize.define('Pencatat', {
  nik_pencatat: {
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
  nip_pencatat: {
    type: DataTypes.CHAR(18),
    allowNull: false  // Wajib karena pegawai pemerintah
  },
  id_akun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Akun,
      key: 'id_akun'
    }
  }
}, {
  tableName: 'pencatat',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Pencatat.belongsTo(Akun, { foreignKey: 'id_akun' });

module.exports = Pencatat;
