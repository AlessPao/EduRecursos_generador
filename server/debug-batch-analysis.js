import { 
  analyzeResourceSemantics, 
  analyzeBatchResourcesSemantics 
} from './src/services/metrics.service.js';
import Recurso from './src/models/Recurso.js';
import './src/models/associations.js';

async function debugBatchAnalysis() {
  console.log('=== DEBUG: Análisis por Lotes ===\n');

  try {
    // Obtener algunos recursos
    const recursos = await Recurso.findAll({
      limit: 3,
      order: [['createdAt', 'DESC']]
    });

    if (recursos.length === 0) {
      console.log('No se encontraron recursos');
      return;
    }

    console.log(`Encontrados ${recursos.length} recursos para analizar\n`);

    // Analizar cada recurso individualmente primero
    console.log('--- ANÁLISIS INDIVIDUAL ---');
    const individualResults = [];
    
    for (let i = 0; i < recursos.length; i++) {
      const recurso = recursos[i];
      console.log(`\nRecurso ${i + 1}: ${recurso.titulo} (${recurso.tipo})`);
      
      const analysis = analyzeResourceSemantics(recurso);
      individualResults.push(analysis);
      
      if (analysis.error) {
        console.log(`  ❌ Error: ${analysis.error}`);
      } else {
        console.log(`  ✅ Textos extraídos: ${analysis.textExtraction.totalTexts}`);
        console.log(`  📝 Oraciones: ${analysis.grammaticalCorrectness.totalSentences} (correctas: ${analysis.grammaticalCorrectness.correctSentences})`);
        console.log(`  📊 Gramática: ${analysis.grammaticalCorrectness.percentage}%`);
        console.log(`  📚 TTR: ${analysis.lexicalRichness.averageTTR} (tokens: ${analysis.lexicalRichness.totalTokens}, tipos: ${analysis.lexicalRichness.uniqueTypes})`);
      }
    }

    // Ahora analizar por lotes
    console.log('\n--- ANÁLISIS POR LOTES ---');
    const batchAnalysis = analyzeBatchResourcesSemantics(recursos);
    
    console.log('\nResultado del análisis por lotes:');
    console.log(JSON.stringify(batchAnalysis.summary, null, 2));
    
    console.log('\nMétricas agregadas:');
    console.log(JSON.stringify(batchAnalysis.aggregatedMetrics, null, 2));

    // Verificar la lógica de agregación manualmente
    console.log('\n--- VERIFICACIÓN MANUAL ---');
    
    let totalGrammaticalPercentages = [];
    let totalTTRValues = [];
    let totalTexts = 0;
    let totalSentences = 0;
    let totalCorrectSentences = 0;
    let totalTokens = 0;
    let totalTypes = 0;

    individualResults.forEach((analysis, index) => {
      if (!analysis.error) {
        totalTexts += analysis.textExtraction.totalTexts;
        totalSentences += analysis.grammaticalCorrectness.totalSentences;
        totalCorrectSentences += analysis.grammaticalCorrectness.correctSentences;
        totalTokens += analysis.lexicalRichness.totalTokens;
        totalTypes += analysis.lexicalRichness.uniqueTypes;
        
        if (analysis.grammaticalCorrectness.percentage > 0) {
          totalGrammaticalPercentages.push(analysis.grammaticalCorrectness.percentage);
        }
        
        if (analysis.lexicalRichness.averageTTR > 0) {
          totalTTRValues.push(analysis.lexicalRichness.averageTTR);
        }

        console.log(`Recurso ${index + 1} contribuye:`);
        console.log(`  - Gramática: ${analysis.grammaticalCorrectness.percentage}%`);
        console.log(`  - TTR: ${analysis.lexicalRichness.averageTTR}`);
        console.log(`  - Oraciones: ${analysis.grammaticalCorrectness.totalSentences} (correctas: ${analysis.grammaticalCorrectness.correctSentences})`);
        console.log(`  - Tokens: ${analysis.lexicalRichness.totalTokens}, Tipos: ${analysis.lexicalRichness.uniqueTypes}`);
      }
    });

    const avgGrammatical = totalGrammaticalPercentages.length > 0 ? 
      totalGrammaticalPercentages.reduce((a, b) => a + b, 0) / totalGrammaticalPercentages.length : 0;
    
    const avgTTR = totalTTRValues.length > 0 ?
      totalTTRValues.reduce((a, b) => a + b, 0) / totalTTRValues.length : 0;

    const globalGrammaticalPercentage = totalSentences > 0 ? 
      (totalCorrectSentences / totalSentences) * 100 : 0;

    const globalTTR = totalTokens > 0 ? 
      totalTypes / totalTokens : 0;

    console.log('\nCálculos manuales:');
    console.log(`- Promedio gramática individual: ${avgGrammatical.toFixed(2)}%`);
    console.log(`- Promedio TTR individual: ${avgTTR.toFixed(4)}`);
    console.log(`- Gramática global: ${globalGrammaticalPercentage.toFixed(2)}%`);
    console.log(`- TTR global: ${globalTTR.toFixed(4)}`);
    console.log(`- Total oraciones: ${totalSentences}, correctas: ${totalCorrectSentences}`);
    console.log(`- Total tokens: ${totalTokens}, tipos únicos: ${totalTypes}`);

    // Comparar con el resultado del batch
    console.log('\n--- COMPARACIÓN ---');
    console.log('Batch vs Manual:');
    console.log(`- Gramática promedio: ${batchAnalysis.summary.averageGrammaticalCorrectness} vs ${Math.round(avgGrammatical)}`);
    console.log(`- TTR promedio: ${batchAnalysis.summary.averageLexicalRichness} vs ${Math.round(avgTTR * 100) / 100}`);
    console.log(`- Gramática global: ${batchAnalysis.aggregatedMetrics.globalGrammaticalPercentage} vs ${Math.round(globalGrammaticalPercentage)}`);
    console.log(`- TTR global: ${batchAnalysis.aggregatedMetrics.globalTTR} vs ${Math.round(globalTTR * 100) / 100}`);

    // Debuggear el contenido de un recurso específico
    console.log('\n--- DEBUG CONTENIDO ESPECÍFICO ---');
    const primerRecurso = recursos[0];
    console.log(`Debuggeando contenido del recurso: ${primerRecurso.titulo}`);
    console.log('Tipo:', primerRecurso.tipo);
    console.log('Contenido raw:');
    console.log(JSON.stringify(primerRecurso.contenido, null, 2));

  } catch (error) {
    console.error('Error en debug:', error);
  }
}

debugBatchAnalysis().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error ejecutando debug:', error);
  process.exit(1);
});
