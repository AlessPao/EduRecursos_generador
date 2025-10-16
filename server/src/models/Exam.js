import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

// Exam model for storing generated evaluations
export const Exam = sequelize.define('Exam', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },  usuarioId: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  slug: { type: DataTypes.STRING, unique: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  texto: { type: DataTypes.TEXT, allowNull: false },
  preguntas: { type: DataTypes.JSONB, allowNull: false }, // array of { pregunta, opciones, respuestaCorrecta }
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

export default Exam;