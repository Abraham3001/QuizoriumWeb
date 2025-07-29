// models/attempt.js
const { DataTypes } = require('sequelize');
const sequelize      = require('../database/db');

const Attempt = sequelize.define('Attempt', {
  score: {
    type: DataTypes.INTEGER,
    allowNull: true  // se calculará tras entregar
  }
});

module.exports = Attempt;
