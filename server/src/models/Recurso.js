import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

const Recurso = sequelize.define('Recurso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('comprension', 'escritura', 'gramatica', 'oral', 'drag_and_drop', 'ice_breakers'),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contenido: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  meta: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  tiempoGeneracionSegundos: {
    type: DataTypes.REAL,
    allowNull: true
  }
}, {
  tableName: 'recursos',
  timestamps: true
});

export default Recurso;