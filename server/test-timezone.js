import { sequelize } from './src/models/db.js';
import Recurso from './src/models/Recurso.js';
import { obtenerFechaHoraPeru, formatearFechaHora } from './src/utils/dateFormatter.js';

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos\n');
    
    // Obtener el último recurso
    const recurso = await Recurso.findOne({
      order: [['createdAt', 'DESC']]
    });
    
    // Obtener los últimos 3 recursos
    const recursos = await Recurso.findAll({
      order: [['createdAt', 'DESC']],
      limit: 3
    });
    
    if (recursos.length > 0) {
      console.log('Últimos 3 recursos creados:\n');
      recursos.forEach((rec, idx) => {
        console.log(`--- Recurso ${idx + 1} ---`);
        console.log('ID:', rec.id);
        console.log('Título:', rec.titulo);
        console.log('Creado:', rec.createdAt);
        console.log('horaInicio:', rec.horaInicio?.toString());
        console.log('horaFin:', rec.horaFin?.toString());
        console.log('');
      });
    } else {
      console.log('No hay recursos en la base de datos');
    }
    
    console.log('\n--- Prueba de función actual ---');
    const ahoraTest = obtenerFechaHoraPeru();
    console.log('obtenerFechaHoraPeru():');
    console.log('  toString():', ahoraTest.toString());
    console.log('  toISOString():', ahoraTest.toISOString());
    console.log('  formatearFechaHora():', formatearFechaHora(ahoraTest));
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
  }
}

test();
