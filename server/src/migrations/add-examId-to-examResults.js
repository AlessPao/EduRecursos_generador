/**
 * Migración para agregar columnas examId y usuarioId a la tabla ExamResults
 * y establecer relaciones FK con las tablas Exams y usuarios
 */

import { sequelize } from '../models/db.js';
import { QueryTypes } from 'sequelize';

export async function migrateExamResults() {
  try {
    console.log('Iniciando migración de ExamResults...');
    
    // Paso 1-6: Usar transacción para las operaciones de datos
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Agregar la columna examId (nullable temporalmente)
      await sequelize.query(
        `ALTER TABLE "ExamResults" 
         ADD COLUMN IF NOT EXISTS "examId" UUID;`,
        { transaction }
      );
      console.log('✓ Columna examId agregada');
      
      // 2. Agregar la columna usuarioId (nullable temporalmente)
      await sequelize.query(
        `ALTER TABLE "ExamResults" 
         ADD COLUMN IF NOT EXISTS "usuarioId" INTEGER;`,
        { transaction }
      );
      console.log('✓ Columna usuarioId agregada');
      
      // 3. Poblar examId usando examSlug
      await sequelize.query(
        `UPDATE "ExamResults" 
         SET "examId" = "Exams"."id"
         FROM "Exams"
         WHERE "ExamResults"."examSlug" = "Exams"."slug";`,
        { transaction }
      );
      console.log('✓ Datos de examId poblados');
      
      // 4. Poblar usuarioId usando examId
      await sequelize.query(
        `UPDATE "ExamResults" 
         SET "usuarioId" = "Exams"."usuarioId"
         FROM "Exams"
         WHERE "ExamResults"."examId" = "Exams"."id";`,
        { transaction }
      );
      console.log('✓ Datos de usuarioId poblados');
      
      // 5. Verificar que no haya registros sin examId o usuarioId
      const [orphanResults] = await sequelize.query(
        `SELECT COUNT(*) as count FROM "ExamResults" 
         WHERE "examId" IS NULL OR "usuarioId" IS NULL;`,
        { transaction, type: QueryTypes.SELECT }
      );
      
      if (orphanResults.count > 0) {
        console.warn(`⚠ Se encontraron ${orphanResults.count} resultados huérfanos (sin examen o usuario asociado)`);
        console.warn('Eliminando resultados huérfanos...');
        await sequelize.query(
          `DELETE FROM "ExamResults" WHERE "examId" IS NULL OR "usuarioId" IS NULL;`,
          { transaction }
        );
      }
      
      // 6. Hacer las columnas NOT NULL
      await sequelize.query(
        `ALTER TABLE "ExamResults" 
         ALTER COLUMN "examId" SET NOT NULL,
         ALTER COLUMN "usuarioId" SET NOT NULL;`,
        { transaction }
      );
      console.log('✓ Columnas configuradas como NOT NULL');
      
      await transaction.commit();
      console.log('✓ Transacción de datos completada');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
    // Paso 7-10: Operaciones sin transacción para constraints e índices
    
    // 7. Agregar la foreign key constraint para examId (si no existe)
    try {
      await sequelize.query(
        `ALTER TABLE "ExamResults" 
         ADD CONSTRAINT "fk_examResults_exam" 
         FOREIGN KEY ("examId") 
         REFERENCES "Exams"("id") 
         ON DELETE CASCADE 
         ON UPDATE CASCADE;`
      );
      console.log('✓ Foreign key para examId agregada');
    } catch (error) {
      if (error.parent?.code === '42710') {
        console.log('⚠ Foreign key para examId ya existe (omitiendo)');
      } else {
        throw error;
      }
    }
    
    // 8. Agregar la foreign key constraint para usuarioId (si no existe)
    try {
      await sequelize.query(
        `ALTER TABLE "ExamResults" 
         ADD CONSTRAINT "fk_examResults_usuario" 
         FOREIGN KEY ("usuarioId") 
         REFERENCES "usuarios"("id") 
         ON DELETE CASCADE 
         ON UPDATE CASCADE;`
      );
      console.log('✓ Foreign key para usuarioId agregada');
    } catch (error) {
      if (error.parent?.code === '42710') {
        console.log('⚠ Foreign key para usuarioId ya existe (omitiendo)');
      } else {
        throw error;
      }
    }
    
    // 9. Crear índices para mejorar performance
    await sequelize.query(
      `CREATE INDEX IF NOT EXISTS "idx_examResults_examId" 
       ON "ExamResults"("examId");`
    );
    console.log('✓ Índice para examId creado');
    
    await sequelize.query(
      `CREATE INDEX IF NOT EXISTS "idx_examResults_usuarioId" 
       ON "ExamResults"("usuarioId");`
    );
    console.log('✓ Índice para usuarioId creado');
    
    console.log('✅ Migración completada exitosamente');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateExamResults()
    .then(() => {
      console.log('Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}
