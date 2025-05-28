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
  preguntas: { type: DataTypes.JSONB, allowNull: false } // array of { pregunta, opciones, respuestaCorrecta }
});

export default Exam;