import fetch from 'node-fetch';

async function testSemanticEndpoint() {
  try {
    console.log('🔍 TESTING ENDPOINT SEMÁNTICO BATCH');
    console.log('==================================\n');

    // Probar el endpoint sin autenticación (porque no requerimos auth en este endpoint)
    const userId = 1; // Paolo
    console.log(`📊 Llamando endpoint: /api/semantics/batch?usuarioId=${userId}`);
    
    const response = await fetch(`http://localhost:5000/api/semantics/batch?usuarioId=${userId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('\n📋 RESPUESTA DEL ENDPOINT:');
    console.log('==========================');
    console.log(`✅ Success: ${data.success}`);
    
    if (data.success && data.data) {
      const analysis = data.data;
      console.log('\n📊 RESUMEN:');
      console.log(`- Total recursos: ${analysis.summary.totalResources}`);
      console.log(`- Recursos analizados: ${analysis.summary.analyzedResources}`);
      console.log(`- Gramática promedio: ${analysis.summary.averageGrammaticalCorrectness}%`);
      console.log(`- TTR promedio: ${analysis.summary.averageLexicalRichness}`);
      console.log(`- Calidad general: ${analysis.summary.overallQuality}`);
      
      console.log('\n📈 MÉTRICAS AGREGADAS:');
      console.log(`- Total textos: ${analysis.aggregatedMetrics.totalTexts}`);
      console.log(`- Total oraciones: ${analysis.aggregatedMetrics.totalSentences}`);
      console.log(`- Oraciones correctas: ${analysis.aggregatedMetrics.totalCorrectSentences}`);
      console.log(`- Tokens totales: ${analysis.aggregatedMetrics.totalTokens}`);
      console.log(`- Tipos únicos: ${analysis.aggregatedMetrics.totalUniqueTypes}`);
    } else {
      console.log('❌ No se encontraron datos en la respuesta');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSemanticEndpoint();
