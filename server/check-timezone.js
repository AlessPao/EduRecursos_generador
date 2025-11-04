/**
 * Script para verificar la configuración de timezone de PostgreSQL
 */

import { sequelize } from './src/models/db.js';

async function checkTimezone() {
  try {
    console.log('=== Verificación de Timezone en PostgreSQL ===\n');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');
    
    // Consultar el timezone actual de PostgreSQL
    const timezoneResult = await sequelize.query("SHOW TIME ZONE;", { 
      type: sequelize.QueryTypes.SELECT 
    });
    console.log('Timezone de PostgreSQL:');
    console.log(timezoneResult);
    console.log();
    
    // Consultar la hora actual en diferentes formatos
    const currentTimeResults = await sequelize.query(`
      SELECT 
        NOW() as now_timestamp,
        CURRENT_TIMESTAMP as current_timestamp,
        NOW() AT TIME ZONE 'America/Lima' as lima_time,
        NOW() AT TIME ZONE 'UTC' as utc_time;
    `, { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    console.log('Hora actual en diferentes zonas:');
    console.log('  NOW():', currentTimeResults[0].now_timestamp);
    console.log('  CURRENT_TIMESTAMP:', currentTimeResults[0].current_timestamp);
    console.log('  America/Lima:', currentTimeResults[0].lima_time);
    console.log('  UTC:', currentTimeResults[0].utc_time);
    console.log();
    
    // Probar inserción de timestamp
    const testTimestamp = new Date().toISOString();
    console.log('Prueba de inserción:');
    console.log('  JavaScript Date (ISO):', testTimestamp);
    console.log('  Sequelize timezone config:', sequelize.options.timezone);
    
    await sequelize.close();
    console.log('\n✅ Prueba completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkTimezone();
