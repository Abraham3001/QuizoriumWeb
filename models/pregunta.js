const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');
const Cuestionario = require('./cuestionario');

const Pregunta = sequelize.define('Pregunta', {
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('abierta', 'opcion_multiple', 'si_no', 'check'),
    allowNull: true
  },
  opciones: {
    type: DataTypes.JSON,
    allowNull: true
  },
  respuesta: {
    type: DataTypes.JSON,
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Relación correcta
Pregunta.belongsTo(Cuestionario, { foreignKey: 'cuestionarioId' });
Cuestionario.hasMany(Pregunta, { foreignKey: 'cuestionarioId', as: 'preguntas' });

module.exports = Pregunta;