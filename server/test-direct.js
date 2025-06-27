import { analyzeResourceSemantics, extractTextFromResource } from './src/services/metrics.service.js';

// Simular un recurso como el que vimos
const testRecurso = {
  id: 141,
  usuarioId: 8,
  tipo: "gramatica",
  titulo: "Gramática Básica",
  contenido: {
    items: [
      {
        consigna: "Escribe una oración con la palabra 'casa'",
        respuesta: "Mi casa es bonita"
      }
    ],
    titulo: "Recurso de gramatica",
    ejemplo: "La niña come manzana",
    instrucciones: "Completa los ejercicios siguiendo el ejemplo"
  }
};

console.log('🧪 PRUEBA DIRECTA DE ANÁLISIS');
console.log('=' .repeat(40));

try {
  // Probar extracción de texto
  console.log('1. Probando extracción de texto...');
  const texts = extractTextFromResource(testRecurso);
  console.log('   Textos extraídos:', texts);
  console.log('   Cantidad de textos:', texts.length);

  // Probar análisis completo
  console.log('\n2. Probando análisis completo...');
  const analysis = analyzeResourceSemantics(testRecurso);
  console.log('   Análisis completo:', JSON.stringify(analysis, null, 2));

} catch (error) {
  console.error('❌ Error:', error);
}
