import Usuario from './Usuario.js';
import Recurso from './Recurso.js';
import RecoveryCode from './RecoveryCode.js';
import Exam from './Exam.js';
import ExamResult from './ExamResult.js';

// Definir relaciones entre modelos
Usuario.hasMany(Recurso, { 
  foreignKey: 'usuarioId',
  as: 'recursos'
});

Recurso.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

// Relaciones para Exams
Usuario.hasMany(Exam, {
  foreignKey: 'usuarioId',
  as: 'exams'
});

Exam.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

// Relaciones para ExamResults
Exam.hasMany(ExamResult, {
  foreignKey: 'examId',
  as: 'results'
});

ExamResult.belongsTo(Exam, {
  foreignKey: 'examId',
  as: 'exam'
});

// Relación directa Usuario -> ExamResults
Usuario.hasMany(ExamResult, {
  foreignKey: 'usuarioId',
  as: 'examResults'
});

ExamResult.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

export { Usuario, Recurso, RecoveryCode, Exam, ExamResult };