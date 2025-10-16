/**
 * Migración para cambiar el tipo de dato de horaInicio y horaFin
 * de TIMESTAMPTZ (DATE) a VARCHAR(50) en todas las tablas
 */

import { sequelize } from '../models/db.js';

export async function changeTimestampsToString() {
  try {
    console.log('Iniciando migración: cambio de timestamps a string...');
    
    // Cambiar tipo de dato en tabla recursos
    console.log('\n1. Actualizando tabla recursos...');
    await sequelize.query(`
      ALTER TABLE recursos 
      ALTER COLUMN "horaInicio" TYPE VARCHAR(50),
      ALTER COLUMN "horaFin" TYPE VARCHAR(50);
    `);
    console.log('✓ Tabla recursos actualizada');
    
    // Cambiar tipo de dato en tabla Exams
    console.log('\n2. Actualizando tabla Exams...');
    await sequelize.query(`
      ALTER TABLE "Exams" 
      ALTER COLUMN "horaInicio" TYPE VARCHAR(50),
      ALTER COLUMN "horaFin" TYPE VARCHAR(50);
    `);
    console.log('✓ Tabla Exams actualizada');
    
    // Cambiar tipo de dato en tabla ExamResults
    console.log('\n3. Actualizando tabla ExamResults...');
    await sequelize.query(`
      ALTER TABLE "ExamResults" 
      ALTER COLUMN "horaInicio" TYPE VARCHAR(50),
      ALTER COLUMN "horaFin" TYPE VARCHAR(50);
    `);
    console.log('✓ Tabla ExamResults actualizada');
    
    console.log('\n✅ Migración completada exitosamente');
    console.log('Nota: Los datos existentes en formato ISO serán preservados.');
    console.log('Los nuevos registros usarán el formato DD/MM/YYYY HH:MM:SS');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  changeTimestampsToString()
    .then(async () => {
      console.log('\nMigración finalizada');
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Error fatal:', error);
      await sequelize.close();
      process.exit(1);
    });
}
