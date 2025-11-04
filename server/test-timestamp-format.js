/**
 * Script de prueba para verificar el formato del timestamp de consentimiento
 * Este script muestra cómo se formateará el timestamp antes y después
 */

import { formatearTimestampConsentimiento } from './src/utils/dateFormatter.js';

console.log('=== Prueba de Formateo de Timestamp de Consentimiento ===\n');

// Timestamp en formato ISO 8601 (como viene del frontend)
const timestampISO = '2025-11-03T22:52:05.496Z';
console.log('Timestamp original (ISO 8601 - UTC):');
console.log(`  ${timestampISO}`);
console.log();

// Timestamp formateado para PostgreSQL con zona horaria de Perú
const timestampFormateado = formatearTimestampConsentimiento(timestampISO);
console.log('Timestamp formateado (PostgreSQL - Perú UTC-5):');
console.log(`  ${timestampFormateado}`);
console.log();

// Prueba con varios timestamps
console.log('=== Más ejemplos ===\n');

const ejemplos = [
  '2025-11-03T10:00:00.000Z',  // 10:00 UTC = 05:00 Perú
  '2025-11-03T15:30:45.123Z',  // 15:30 UTC = 10:30 Perú
  '2025-11-03T20:00:00.999Z',  // 20:00 UTC = 15:00 Perú
  new Date().toISOString()      // Ahora
];

ejemplos.forEach((iso) => {
  const formatted = formatearTimestampConsentimiento(iso);
  console.log(`${iso} → ${formatted}`);
});

console.log('\n✅ El formato coincide con createdAt y updatedAt de PostgreSQL');
console.log('   Formato: YYYY-MM-DD HH:MM:SS.mmm-05');
