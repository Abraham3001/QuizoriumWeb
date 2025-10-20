const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Usuario = sequelize.define('Usuario', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  googleId: {
    type: DataTypes.STRING,
  },
  rol: {
    type: DataTypes.ENUM('estudiante', 'profesor'),
    defaultValue: 'estudiante',
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

});


module.exports = Usuario;
