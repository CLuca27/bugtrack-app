const {DataTypes } = require('sequelize');
const sequelize = require("../sequelize")

const Project = sequelize.define('Project', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  repositoryLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'in-progress',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});