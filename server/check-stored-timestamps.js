/**
 * Script para ver cómo se almacenan realmente los timestamps en la BD
 */

import { sequelize } from './src/models/db.js';

async function checkStoredTimestamps() {
  try {
    console.log('=== Verificación de Timestamps Almacenados ===\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');
    
    // Consultar un usuario reciente con sus timestamps en formato crudo
    const result = await sequelize.query(`
      SELECT 
        id,
        nombre,
        email,
        "createdAt"::text as created_at_text,
        "updatedAt"::text as updated_at_text,
        "privacyConsentTimestamp" as privacy_consent_text
      FROM usuarios 
      ORDER BY id DESC 
      LIMIT 1;
    `, { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    if (result.length > 0) {
      const usuario = result[0];
      console.log('Usuario más reciente:');
      console.log(`  ID: ${usuario.id}`);
      console.log(`  Nombre: ${usuario.nombre}`);
      console.log(`  Email: ${usuario.email}`);
      console.log();
      console.log('Timestamps almacenados (formato crudo):');
      console.log(`  createdAt:  ${usuario.created_at_text}`);
      console.log(`  updatedAt:  ${usuario.updated_at_text}`);
      console.log(`  privacyConsentTimestamp: ${usuario.privacy_consent_text}`);
      console.log();
      
      // Analizar los offsets
      const createdOffset = usuario.created_at_text.match(/([+-]\d{2})/)?.[1];
      const privacyOffset = usuario.privacy_consent_text?.match(/([+-]\d{2})/)?.[1];
      
      console.log('Análisis de timezone offsets:');
      console.log(`  createdAt offset: ${createdOffset || 'No encontrado'}`);
      console.log(`  privacyConsentTimestamp offset: ${privacyOffset || 'No encontrado'}`);
      
      if (createdOffset && privacyOffset && createdOffset !== privacyOffset) {
        console.log();
        console.log('⚠️  INCONSISTENCIA DETECTADA:');
        console.log(`  createdAt usa ${createdOffset} pero privacyConsentTimestamp usa ${privacyOffset}`);
        console.log(`  Perú debería usar -05 (UTC-5)`);
      }
    } else {
      console.log('No hay usuarios en la base de datos');
    }
    
    await sequelize.close();
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

checkStoredTimestamps();
