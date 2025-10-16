import { migrateExamResults } from './src/migrations/add-examId-to-examResults.js';
import { addTimestampColumns } from './src/migrations/add-timestamp-columns.js';
import { changeTimestampsToString } from './src/migrations/change-timestamps-to-string.js';
import { sequelize } from './src/models/db.js';

async function runMigration() {
  try {
    console.log('🚀 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✓ Conexión establecida\n');
    
    console.log('📦 Ejecutando migraciones...\n');
    
    // Migración 1: ExamResults
    console.log('--- Migración 1: ExamResults ---');
    await migrateExamResults();
    console.log('');
    
    // Migración 2: Timestamps
    console.log('--- Migración 2: Timestamps ---');
    await addTimestampColumns();
    console.log('');
    
    // Migración 3: Cambiar timestamps a string
    console.log('--- Migración 3: Timestamps a String ---');
    await changeTimestampsToString();
    console.log('');
    
    console.log('\n✅ Todas las migraciones completadas');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando migraciones:', error);
    await sequelize.close();
    process.exit(1);
  }
}

runMigration();
