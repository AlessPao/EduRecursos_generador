import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

// ExamResult model for storing student submissions
export const ExamResult = sequelize.define('ExamResult', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentName: { type: DataTypes.STRING, allowNull: false },
  respuestas: { type: DataTypes.JSONB, allowNull: false }, // array of { preguntaIndex, respuestaSeleccionada }
  score: { type: DataTypes.FLOAT, allowNull: false },
  examSlug: { type: DataTypes.STRING, allowNull: false },
  evalTime: { type: DataTypes.FLOAT, allowNull: true } // tiempo en segundos
});

export default ExamResult;
