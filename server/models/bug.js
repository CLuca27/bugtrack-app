const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize') 

const Bug = sequelize.define('Bug', {
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  commitLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progres', 'solved'),
    defaultValue: 'open',
  }, 
   projectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }, 
  
  reporterId: { 
    type: DataTypes.INTEGER, 
    allowNull: false
  },
  assignedToId: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    defaultValue: null
  }
}); 

module.exports = Bug; 
