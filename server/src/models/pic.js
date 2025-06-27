const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Akun = require('./akun');

const PIC = sequelize.define('PIC', {
  nik_pic: { type: DataTypes.CHAR, primaryKey: true },
  nama_lengkap: { type: DataTypes.STRING, allowNull: false },
  alamat: { type: DataTypes.TEXT, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  nip: { type: DataTypes.CHAR, allowNull: true },
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
  tableName: 'pic',
  timestamps: false
});

PIC.belongsTo(Akun, { foreignKey: 'id_akun' });

module.exports = PIC;
