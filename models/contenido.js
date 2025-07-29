const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Contenido = sequelize.define('Contenido', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subtitulo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  alt: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Contenido;
