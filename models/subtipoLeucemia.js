const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const SubtipoLeucemia = sequelize.define('SubtipoLeucemia', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipoLeucemiaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TipoLeucemia', // <- este nombre debe coincidir con el `tableName` exacto
      key: 'id'
    }
  }
}, {
  tableName: 'SubtipoLeucemia' // también es buena práctica aquí
});


// Asociación con TipoLeucemia
SubtipoLeucemia.associate = (models) => {
  SubtipoLeucemia.belongsTo(models.TipoLeucemia, {
    foreignKey: 'tipoLeucemiaId',
    as: 'tipo'
  });
};

module.exports = SubtipoLeucemia;
