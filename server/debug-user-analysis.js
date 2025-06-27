import { 
  analyzeResourceSemantics, 
  analyzeBatchResourcesSemantics 
} from './src/services/metrics.service.js';
import Recurso from './src/models/Recurso.js';
import Usuario from './src/models/Usuario.js';
import './src/models/associations.js';

async function debugUserAnalysis() {
  console.log('=== DEBUG: Análisis de Usuario Específico ===\n');

  try {
    // Encontrar el primer usuario que tenga recursos (de forma simple)
    const primerUsuario = await Usuario.findByPk(1); // Probamos con el usuario 1
    
    if (!primerUsuario) {
      console.log('No se encontró el usuario 1');
      return;
    }

    const userId = primerUsuario.id;
    console.log(`Debuggeando usuario: ${primerUsuario.nombre} (ID: ${userId})`);

    // Obtener recursos del usuario (como lo hace el controlador)
    const recursos = await Recurso.findAll({
      where: { usuarioId: userId },
      limit: 5 // Limitar para debug
    });

    console.log(`\nRecursos encontrados: ${recursos.length}`);

    if (recursos.length === 0) {
      console.log('No se encontraron recursos para este usuario');
      return;
    }

    // Mostrar información de los recursos
    console.log('\n--- RECURSOS DEL USUARIO ---');
    recursos.forEach((recurso, index) => {
      console.log(`${index + 1}. ${recurso.titulo} (${recurso.tipo})`);
      console.log(`   ID: ${recurso.id}, Usuario: ${recurso.usuarioId}`);
      console.log(`   Contenido: ${JSON.stringify(recurso.contenido).substring(0, 100)}...`);
    });

    // Analizar recursos uno por uno
    console.log('\n--- ANÁLISIS INDIVIDUAL ---');
    const individualResults = [];
    for (let i = 0; i < recursos.length; i++) {
      const recurso = recursos[i];
      console.log(`\nAnalizando recurso ${i + 1}: ${recurso.titulo}`);
      
      const analysis = analyzeResourceSemantics(recurso);
      individualResults.push(analysis);
      
      if (analysis.error) {
        console.log(`  ❌ Error: ${analysis.error}`);
      } else {
        console.log(`  ✅ Textos: ${analysis.textExtraction.totalTexts}`);
        console.log(`  📝 Oraciones: ${analysis.grammaticalCorrectness.totalSentences} (correctas: ${analysis.grammaticalCorrectness.correctSentences})`);
        console.log(`  📊 Gramática: ${analysis.grammaticalCorrectness.percentage}%`);
        console.log(`  📚 TTR: ${analysis.lexicalRichness.averageTTR}`);
        console.log(`  🏆 Calidad: ${analysis.overallQuality.qualityLevel}`);
      }
    }

    // Ahora hacer análisis por lotes
    console.log('\n--- ANÁLISIS POR LOTES ---');
    const batchAnalysis = analyzeBatchResourcesSemantics(recursos);
    
    console.log('Estructura del resultado por lotes:');
    console.log('Keys:', Object.keys(batchAnalysis));
    
    if (batchAnalysis.summary) {
      console.log('\nSummary:');
      console.log(JSON.stringify(batchAnalysis.summary, null, 2));
    }

    if (batchAnalysis.aggregatedMetrics) {
      console.log('\nAggregated Metrics:');
      console.log(JSON.stringify(batchAnalysis.aggregatedMetrics, null, 2));
    }

    if (batchAnalysis.individualAnalyses) {
      console.log(`\nIndividual Analyses count: ${batchAnalysis.individualAnalyses.length}`);
      batchAnalysis.individualAnalyses.forEach((analysis, index) => {
        console.log(`  ${index + 1}. ${analysis.resourceInfo.titulo}: Grammar ${analysis.grammaticalCorrectness.percentage}%, TTR ${analysis.lexicalRichness.averageTTR}`);
      });
    }

    // Verificar si hay discrepancias
    console.log('\n--- VERIFICACIÓN ---');
    const validIndividual = individualResults.filter(r => !r.error);
    
    if (validIndividual.length > 0) {
      const avgGrammarIndividual = validIndividual.reduce((sum, r) => sum + r.grammaticalCorrectness.percentage, 0) / validIndividual.length;
      const avgTTRIndividual = validIndividual.reduce((sum, r) => sum + r.lexicalRichness.averageTTR, 0) / validIndividual.length;
      
      console.log(`Promedio individual gramática: ${avgGrammarIndividual.toFixed(2)}%`);
      console.log(`Promedio individual TTR: ${avgTTRIndividual.toFixed(4)}`);
      console.log(`Batch gramática: ${batchAnalysis.summary.averageGrammaticalCorrectness}%`);
      console.log(`Batch TTR: ${batchAnalysis.summary.averageLexicalRichness}`);
      
      if (Math.abs(avgGrammarIndividual - batchAnalysis.summary.averageGrammaticalCorrectness) > 1) {
        console.log('⚠️ DISCREPANCIA en gramática detectada!');
      }
      
      if (Math.abs(avgTTRIndividual - batchAnalysis.summary.averageLexicalRichness) > 0.01) {
        console.log('⚠️ DISCREPANCIA en TTR detectada!');
      }
    }

  } catch (error) {
    console.error('Error en debug de usuario:', error);
    console.error('Stack:', error.stack);
  }
}

debugUserAnalysis().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error ejecutando debug de usuario:', error);
  process.exit(1);
});
