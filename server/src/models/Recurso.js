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
  },
  horaInicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  horaFin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'recursos',
  timestamps: true,
  getterMethods: {
    horaInicioFormato() {
      if (!this.horaInicio) return null;
      return this.horaInicio.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    },
    horaFinFormato() {
      if (!this.horaFin) return null;
      return this.horaFin.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    }
  }
});

export default Recurso;