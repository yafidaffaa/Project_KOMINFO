const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Akun = require('./akun');

const Admin = sequelize.define('Admin', {
  nik_admin: { type: DataTypes.CHAR, primaryKey: true },
  nama_lengkap: { type: DataTypes.STRING, allowNull: false },
  alamat: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  nip: { type: DataTypes.CHAR, allowNull: false },
  no_hp: { type: DataTypes.CHAR, allowNull: false },
  id_akun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Akun,
      key: 'id_akun'
    }
  }
}, {
  tableName: 'admin',
  timestamps: false
});

// Relasi
Admin.belongsTo(Akun, { foreignKey: 'id_akun' });

module.exports = Admin;
