/**
 * Migración para agregar columnas horaInicio y horaFin
 * a las tablas recursos y Exams
 */

import { sequelize } from '../models/db.js';

export async function addTimestampColumns() {
  try {
    console.log('Iniciando migración de timestamps...');
    
    // 1. Agregar columnas a la tabla recursos
    await sequelize.query(
      `ALTER TABLE "recursos" 
       ADD COLUMN IF NOT EXISTS "horaInicio" TIMESTAMP WITH TIME ZONE,
       ADD COLUMN IF NOT EXISTS "horaFin" TIMESTAMP WITH TIME ZONE;`
    );
    console.log('✓ Columnas horaInicio y horaFin agregadas a recursos');
    
    // 2. Agregar columnas a la tabla Exams
    await sequelize.query(
      `ALTER TABLE "Exams" 
       ADD COLUMN IF NOT EXISTS "tiempoGeneracionSegundos" REAL,
       ADD COLUMN IF NOT EXISTS "horaInicio" TIMESTAMP WITH TIME ZONE,
       ADD COLUMN IF NOT EXISTS "horaFin" TIMESTAMP WITH TIME ZONE;`
    );
    console.log('✓ Columnas tiempoGeneracionSegundos, horaInicio y horaFin agregadas a Exams');
    
    // 3. Agregar columnas a la tabla ExamResults
    await sequelize.query(
      `ALTER TABLE "ExamResults" 
       ADD COLUMN IF NOT EXISTS "horaInicio" TIMESTAMP WITH TIME ZONE,
       ADD COLUMN IF NOT EXISTS "horaFin" TIMESTAMP WITH TIME ZONE;`
    );
    console.log('✓ Columnas horaInicio y horaFin agregadas a ExamResults');
    
    // 4. Para registros existentes, usar createdAt como referencia (opcional)
    // Esto es solo para tener algo de data histórica
    await sequelize.query(
      `UPDATE "recursos" 
       SET "horaFin" = "createdAt" 
       WHERE "horaFin" IS NULL;`
    );
    console.log('✓ Datos históricos poblados en recursos');
    
    await sequelize.query(
      `UPDATE "Exams" 
       SET "horaFin" = "createdAt" 
       WHERE "horaFin" IS NULL;`
    );
    console.log('✓ Datos históricos poblados en Exams');
    
    await sequelize.query(
      `UPDATE "ExamResults" 
       SET "horaFin" = "createdAt" 
       WHERE "horaFin" IS NULL;`
    );
    console.log('✓ Datos históricos poblados en ExamResults');
    
    console.log('✅ Migración de timestamps completada exitosamente');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addTimestampColumns()
    .then(() => {
      console.log('Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}
