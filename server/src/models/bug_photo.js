const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const BugReport = require('./bug_report');

const BugPhoto = sequelize.define('BugPhoto', {
  id_bug_photo: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_bug_report: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BugReport,
      key: 'id_bug_report'
    }
  },
  photo_url: {
    type: DataTypes.TEXT, // URL Firebase
    allowNull: false
  },
  photo_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  urutan: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'bug_photo',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relasi
BugPhoto.belongsTo(BugReport, { foreignKey: 'id_bug_report' });
BugReport.hasMany(BugPhoto, { foreignKey: 'id_bug_report' });

module.exports = BugPhoto;