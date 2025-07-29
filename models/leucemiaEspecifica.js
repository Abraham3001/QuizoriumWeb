const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');
const SubtipoLeucemia = require('./subtipoLeucemia');

const InformacionLeucemia = sequelize.define('InformacionLeucemia', {
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

SubtipoLeucemia.hasMany(InformacionLeucemia, { foreignKey: 'subtipoId' });
InformacionLeucemia.belongsTo(SubtipoLeucemia, { foreignKey: 'subtipoId' });

module.exports = InformacionLeucemia;
