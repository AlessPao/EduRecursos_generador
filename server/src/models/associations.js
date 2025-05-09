import Usuario from './Usuario.js';
import Recurso from './Recurso.js';

// Definir relaciones entre modelos
Usuario.hasMany(Recurso, { 
  foreignKey: 'usuarioId',
  as: 'recursos'
});

Recurso.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

export { Usuario, Recurso };