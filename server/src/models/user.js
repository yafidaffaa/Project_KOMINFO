const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Akun = require('./akun');

const User = sequelize.define('User', {
  nik_user: { type: DataTypes.CHAR, primaryKey: true },
  nama_lengkap: { type: DataTypes.STRING, allowNull: false },
  alamat: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  no_hp: { type: DataTypes.CHAR, allowNull: true },
  id_akun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Akun,
      key: 'id_akun'
    }
  }
}, {
  tableName: 'user',
  timestamps: false
});

User.belongsTo(Akun, { foreignKey: 'id_akun' });

module.exports = User;
