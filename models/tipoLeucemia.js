const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const TipoLeucemia = sequelize.define('TipoLeucemia', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'TipoLeucemia' // <- fuerza el nombre exacto
});


TipoLeucemia.associate = (models) => {
  TipoLeucemia.hasMany(models.SubtipoLeucemia, {
    foreignKey: 'tipoLeucemiaId',
    as: 'subtipos'
  });
};

module.exports = TipoLeucemia;
