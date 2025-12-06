const {DataTypes } = require('sequelize');
const sequelize = require("../sequelize")
const User = require("./user")
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


module.exports = Project

