const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Akun = sequelize.define('Akun', {
  id_akun: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'pic', 'user'), allowNull: false }
}, {
  tableName: 'akun',
  timestamps: false
});

module.exports = Akun;
