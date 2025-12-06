const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const UserProjects = sequelize.define('UserProjects', { 
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
}, {timestamps: false});

module.exports = UserProjects;