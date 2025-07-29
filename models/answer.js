// models/answer.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Answer = sequelize.define('Answer', {
  response: {
    type: DataTypes.JSON,
    allowNull: false
  },
  correct: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  // Nuevos campos snapshot:
  preguntaTexto: {  
    type: DataTypes.STRING,
    allowNull: true
  },
  preguntaOpciones: { 
    type: DataTypes.JSON,
    allowNull: true
  },
  preguntaRespuestaCorrecta: { 
    type: DataTypes.JSON,
    allowNull: true
  },
    preguntaImagen: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Answer;
