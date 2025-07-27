const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Validator = require('./validator');

const BugCategory = sequelize.define('BugCategory', {
  id_kategori: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nama_layanan: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT,
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
  tableName: 'bug_category',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relasi
BugCategory.belongsTo(Validator, { foreignKey: 'nik_validator' });

module.exports = BugCategory;
