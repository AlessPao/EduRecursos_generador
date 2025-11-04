/**
 * Migración: Agregar campo privacyConsentTimestamp a la tabla usuarios
 * 
 * Este campo almacena la fecha y hora exactas en que el usuario otorgó
 * su consentimiento para el tratamiento de datos personales, conforme
 * a la Ley N.º 29733 – Ley de Protección de Datos Personales (Perú).
 * 
 * Fecha: 2025-01-03
 */

import { sequelize } from '../models/db.js';
import { DataTypes } from 'sequelize';

const runMigration = async () => {
  try {
    console.log('🚀 Iniciando migración: Agregar privacyConsentTimestamp a usuarios');

    // Verificar si la columna ya existe
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('usuarios');
    
    if (tableDescription.privacyConsentTimestamp) {
      console.log('⚠️  La columna privacyConsentTimestamp ya existe. Saltando migración.');
      return;
    }

    // Agregar la columna privacyConsentTimestamp
    await queryInterface.addColumn('usuarios', 'privacyConsentTimestamp', {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Fecha y hora en que el usuario otorgó su consentimiento para el tratamiento de datos personales (ISO 8601)'
    });

    console.log('✅ Columna privacyConsentTimestamp agregada correctamente a la tabla usuarios');
    console.log('✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
};

// Ejecutar migración si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => {
      console.log('✅ Proceso de migración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fallo en el proceso de migración:', error);
      process.exit(1);
    });
}

export default runMigration;
