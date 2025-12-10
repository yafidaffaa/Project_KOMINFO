const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Akun = require('./akun');

const AdminSA = sequelize.define('AdminSA', {
  nik_admin_sa: {
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
    allowNull: true,
    unique: {
    args: true,
    msg: 'Email sudah terdaftar'
  }
  },
  alamat: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nip_admin_sa: {
    type: DataTypes.CHAR(18),
    allowNull: false
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
  tableName: 'admin_sa',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relasi ke akun
AdminSA.belongsTo(Akun, { foreignKey: 'id_akun' });

module.exports = AdminSA;
