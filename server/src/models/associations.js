import Usuario from './Usuario.js';
import Recurso from './Recurso.js';
import RecoveryCode from './RecoveryCode.js';
import Exam from './Exam.js';

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

export { Usuario, Recurso, RecoveryCode, Exam };