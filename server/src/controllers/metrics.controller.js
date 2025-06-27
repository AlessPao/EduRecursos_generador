import { analyzeResourceSemantics, analyzeBatchResourcesSemantics } from '../services/metrics.service.js';
import Recurso from '../models/Recurso.js';
import { Sequelize } from 'sequelize';

/**
 * Analiza las métricas semánticas de un recurso específico
 */
export const analyzeResourceMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Buscar el recurso
    const recurso = await Recurso.findOne({
      where: { 
        id: id,
        usuarioId: req.user.userId
      }
    });
    
    if (!recurso) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    // Analizar métricas semánticas
    const analysis = analyzeResourceSemantics(recurso);
    
    res.status(200).json({
      success: true,
      message: 'Análisis semántico completado',
      analysis
    });
  } catch (error) {
    console.error('Error analizando métricas del recurso:', error);
    next(error);
  }
};

/**
 * Analiza las métricas semánticas de múltiples recursos del usuario
 */
export const analyzeBatchMetrics = async (req, res, next) => {
  try {
    const { resourceIds, resourceType, limit = 10 } = req.query;
    
    // Construir filtros
    const whereClause = { usuarioId: req.user.userId };
    
    if (resourceType) {
      whereClause.tipo = resourceType;
    }
    
    if (resourceIds) {
      const ids = resourceIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        whereClause.id = ids;
      }
    }
    
    // Buscar recursos
    const recursos = await Recurso.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 50) // Máximo 50 recursos para evitar sobrecarga
    });
    
    if (recursos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron recursos para analizar'
      });
    }

    // Analizar métricas semánticas en lote
    const batchAnalysis = analyzeBatchResourcesSemantics(recursos);
    
    res.status(200).json({
      success: true,
      message: `Análisis semántico completado para ${recursos.length} recursos`,
      analysis: batchAnalysis
    });
  } catch (error) {
    console.error('Error analizando métricas en lote:', error);
    next(error);
  }
};

/**
 * Obtiene un reporte de métricas semánticas del usuario
 */
export const getMetricsReport = async (req, res, next) => {
  try {
    const { period = '30', resourceType } = req.query;
    
    // Calcular fecha de inicio basada en el período
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Construir filtros
    const whereClause = { 
      usuarioId: req.user.userId,
      createdAt: {
        [Sequelize.Op.gte]: startDate
      }
    };
    
    if (resourceType) {
      whereClause.tipo = resourceType;
    }
    
    // Buscar recursos del período
    const recursos = await Recurso.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: 100 // Límite razonable para el reporte
    });
    
    if (recursos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No se encontraron recursos en el período especificado',
        report: {
          period: `Últimos ${period} días`,
          resourceCount: 0,
          summary: {
            averageGrammaticalCorrectness: 0,
            averageLexicalRichness: 0,
            overallQuality: 'Sin datos'
          }
        }
      });
    }

    // Analizar métricas
    const analysis = analyzeBatchResourcesSemantics(recursos);
    
    // Construir reporte
    const report = {
      period: `Últimos ${period} días`,
      generatedAt: new Date().toISOString(),
      resourceCount: recursos.length,
      summary: analysis.summary,
      metrics: {
        grammaticalCorrectness: {
          average: analysis.summary.averageGrammaticalCorrectness,
          description: 'Porcentaje promedio de oraciones gramaticalmente correctas',
          interpretation: getGrammaticalInterpretation(analysis.summary.averageGrammaticalCorrectness)
        },
        lexicalRichness: {
          average: analysis.summary.averageLexicalRichness,
          description: 'Riqueza léxica promedio (TTR - Type-Token Ratio)',
          interpretation: getLexicalInterpretation(analysis.summary.averageLexicalRichness)
        }
      },
      byResourceType: analysis.resourceTypes,
      recommendations: generateRecommendations(analysis.summary)
    };
    
    res.status(200).json({
      success: true,
      message: 'Reporte de métricas generado',
      report
    });
  } catch (error) {
    console.error('Error generando reporte de métricas:', error);
    next(error);
  }
};

/**
 * Obtiene métricas rápidas del dashboard
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    // Obtener los últimos 10 recursos del usuario
    const recursos = await Recurso.findAll({
      where: { usuarioId: req.user.userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    if (recursos.length === 0) {
      return res.status(200).json({
        success: true,
        metrics: {
          hasData: false,
          message: 'No tienes recursos para analizar aún'
        }
      });
    }

    // Análisis rápido
    const analysis = analyzeBatchResourcesSemantics(recursos);
    
    const dashboardMetrics = {
      hasData: true,
      resourcesAnalyzed: recursos.length,
      grammaticalCorrectness: {
        value: analysis.summary.averageGrammaticalCorrectness,
        level: getGrammaticalLevel(analysis.summary.averageGrammaticalCorrectness),
        color: getGrammaticalColor(analysis.summary.averageGrammaticalCorrectness)
      },
      lexicalRichness: {
        value: analysis.summary.averageLexicalRichness,
        level: getLexicalLevel(analysis.summary.averageLexicalRichness),
        color: getLexicalColor(analysis.summary.averageLexicalRichness)
      },
      overallQuality: {
        level: analysis.summary.overallQuality,
        color: getQualityColor(analysis.summary.overallQuality)
      },
      totalTexts: analysis.aggregatedMetrics.totalTexts,
      totalWords: analysis.aggregatedMetrics.totalTokens
    };
    
    res.status(200).json({
      success: true,
      metrics: dashboardMetrics
    });
  } catch (error) {
    console.error('Error obteniendo métricas del dashboard:', error);
    next(error);
  }
};

// Funciones auxiliares para interpretación

function getGrammaticalInterpretation(percentage) {
  if (percentage >= 90) return 'Excelente: La mayoría de oraciones son gramaticalmente correctas';
  if (percentage >= 80) return 'Bueno: La gran mayoría de oraciones son correctas';
  if (percentage >= 70) return 'Regular: La mayoría de oraciones son correctas, hay margen de mejora';
  if (percentage >= 60) return 'Mejorable: Algunas oraciones necesitan revisión gramatical';
  return 'Necesita mejora: Se recomienda revisar la gramática del contenido';
}

function getLexicalInterpretation(ttr) {
  if (ttr >= 0.7) return 'Excelente: Vocabulario muy variado y rico';
  if (ttr >= 0.6) return 'Bueno: Vocabulario variado con buena diversidad';
  if (ttr >= 0.5) return 'Regular: Vocabulario moderadamente variado';
  if (ttr >= 0.4) return 'Mejorable: Se podría incrementar la variedad de vocabulario';
  return 'Necesita mejora: Vocabulario limitado, se recomienda mayor diversidad';
}

function getGrammaticalLevel(percentage) {
  if (percentage >= 85) return 'Excelente';
  if (percentage >= 75) return 'Bueno';
  if (percentage >= 65) return 'Regular';
  return 'Mejorable';
}

function getLexicalLevel(ttr) {
  if (ttr >= 0.6) return 'Excelente';
  if (ttr >= 0.5) return 'Bueno';
  if (ttr >= 0.4) return 'Regular';
  return 'Mejorable';
}

function getGrammaticalColor(percentage) {
  if (percentage >= 85) return 'green';
  if (percentage >= 75) return 'blue';
  if (percentage >= 65) return 'yellow';
  return 'red';
}

function getLexicalColor(ttr) {
  if (ttr >= 0.6) return 'green';
  if (ttr >= 0.5) return 'blue';
  if (ttr >= 0.4) return 'yellow';
  return 'red';
}

function getQualityColor(level) {
  switch (level) {
    case 'Excelente': return 'green';
    case 'Bueno': return 'blue';
    case 'Regular': return 'yellow';
    case 'Mejorable': return 'orange';
    default: return 'red';
  }
}

function generateRecommendations(summary) {
  const recommendations = [];
  
  if (summary.averageGrammaticalCorrectness < 70) {
    recommendations.push({
      type: 'grammar',
      priority: 'high',
      message: 'Se recomienda revisar la gramática del contenido generado. Considera ajustar los prompts para mejorar la estructura de las oraciones.'
    });
  }
  
  if (summary.averageLexicalRichness < 0.5) {
    recommendations.push({
      type: 'vocabulary',
      priority: 'medium',
      message: 'El vocabulario podría ser más variado. Intenta incluir más sinónimos y palabras descriptivas en tus recursos.'
    });
  }
  
  if (summary.averageGrammaticalCorrectness >= 85 && summary.averageLexicalRichness >= 0.6) {
    recommendations.push({
      type: 'congratulations',
      priority: 'info',
      message: '¡Excelente trabajo! Tus recursos mantienen una alta calidad en gramática y vocabulario.'
    });
  }
  
  return recommendations;
}

export default {
  analyzeResourceMetrics,
  analyzeBatchMetrics,
  getMetricsReport,
  getDashboardMetrics
};
