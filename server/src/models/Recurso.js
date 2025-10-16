import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';
import { formatearSoloHora } from '../utils/dateFormatter.js';

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
  },
  horaInicio: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Formato: DD/MM/YYYY HH:MM:SS'
  },
  horaFin: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Formato: DD/MM/YYYY HH:MM:SS'
  }
}, {
  tableName: 'recursos',
  timestamps: true,
  getterMethods: {
    horaInicioFormato() {
      return formatearSoloHora(this.horaInicio);
    },
    horaFinFormato() {
      return formatearSoloHora(this.horaFin);
    }
  }
});

export default Recurso;