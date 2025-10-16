import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';
import { formatearSoloHora } from '../utils/dateFormatter.js';

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
  getterMethods: {
    horaInicioFormato() {
      return formatearSoloHora(this.horaInicio);
    },
    horaFinFormato() {
      return formatearSoloHora(this.horaFin);
    }
  }
});

export default ExamResult;