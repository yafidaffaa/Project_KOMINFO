const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Akun = require('./akun');

const UserUmum = sequelize.define('UserUmum', {
  nik_user: {
    type: DataTypes.CHAR(16),
    primaryKey: true,
    allowNull: false
  },
  nama: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
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
  tableName: 'user_umum',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

UserUmum.belongsTo(Akun, { foreignKey: 'id_akun' });

module.exports = UserUmum;
