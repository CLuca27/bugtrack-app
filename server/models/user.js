const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize')

const User = sequelize.define('User', { 

  id: {
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey:true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    validate: {isEmail: true}
  },
  role: {
    type: DataTypes.ENUM('MP', 'TST', 'None'),  // Rolurile posibile
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}); 

module.exports = User
