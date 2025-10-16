import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

// ExamResult model for storing student submissions
export const ExamResult = sequelize.define('ExamResult', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  examId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'Exams',
      key: 'id'
    }
  },
  usuarioId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  studentName: { type: DataTypes.STRING, allowNull: false },
  respuestas: { type: DataTypes.JSONB, allowNull: false }, // array of { preguntaIndex, respuestaSeleccionada }
  score: { type: DataTypes.FLOAT, allowNull: false },
  examSlug: { type: DataTypes.STRING, allowNull: false }, // Mantener por compatibilidad
  evalTime: { type: DataTypes.FLOAT, allowNull: true }, // tiempo en segundos
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

export default ExamResult;