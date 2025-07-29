const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Cuestionario = sequelize.define('Cuestionario', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Cuestionario;
