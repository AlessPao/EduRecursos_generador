import { 
  analyzeResourceSemantics, 
  analyzeBatchResourcesSemantics,
  extractTextFromResource,
  extractSentences,
  isGrammaticallyCorrect,
  calculateLexicalRichness
} from '../services/metrics.service.js';
import Recurso from '../models/Recurso.js';
import Usuario from '../models/Usuario.js';
import { Op, Sequelize } from 'sequelize';

/**
 * Analiza las métricas semánticas de un recurso específico
 */
export const analyzeResourceSemanticsController = async (req, res) => {
  try {
    const { id } = req.params;

    const recurso = await Recurso.findByPk(id);
    if (!recurso) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    const analysis = analyzeResourceSemantics(recurso);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error al analizar métricas semánticas del recurso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Analiza las métricas semánticas de múltiples recursos con filtros opcionales
 */
export const analyzeBatchSemanticsController = async (req, res) => {
  try {
    const { 
      tipo, 
      usuarioId, 
      limit = 50, 
      offset = 0,
      fechaDesde,
      fechaHasta 
    } = req.query;

    // Construir filtros
    const whereClause = {};
    
    if (tipo) {
      whereClause.tipo = tipo;
    }
    
    if (usuarioId) {
      whereClause.usuarioId = usuarioId;
    }

    if (fechaDesde || fechaHasta) {
      whereClause.createdAt = {};
      if (fechaDesde) {
        whereClause.createdAt[Op.gte] = new Date(fechaDesde);
      }
      if (fechaHasta) {
        whereClause.createdAt[Op.lte] = new Date(fechaHasta);
      }
    }

    const recursos = await Recurso.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    if (recursos.length === 0) {
      return res.json({
        success: true,
        message: 'No se encontraron recursos con los filtros especificados',
        data: {
          summary: {
            totalResources: 0,
            analyzedResources: 0,
            averageGrammaticalCorrectness: 0,
            averageLexicalRichness: 0
          }
        }
      });
    }

    const batchAnalysis = analyzeBatchResourcesSemantics(recursos);

    res.json({
      success: true,
      data: batchAnalysis,
      filters: {
        tipo,
        usuarioId,
        limit: parseInt(limit),
        offset: parseInt(offset),
        fechaDesde,
        fechaHasta
      }
    });
  } catch (error) {
    console.error('Error al analizar métricas semánticas batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtiene un reporte detallado de métricas semánticas por tipo de recurso
 */
export const getSemanticReportController = async (req, res) => {
  try {
    const { 
      fechaDesde,
      fechaHasta,
      incluirEjemplos = false
    } = req.query;

    // Construir filtros de fecha
    const whereClause = {};
    if (fechaDesde || fechaHasta) {
      whereClause.createdAt = {};
      if (fechaDesde) {
        whereClause.createdAt[Op.gte] = new Date(fechaDesde);
      }
      if (fechaHasta) {
        whereClause.createdAt[Op.lte] = new Date(fechaHasta);
      }
    }

    // Obtener todos los recursos
    const allRecursos = await Recurso.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    if (allRecursos.length === 0) {
      return res.json({
        success: true,
        message: 'No se encontraron recursos en el período especificado',
        data: {
          reportDate: new Date().toISOString(),
          period: { fechaDesde, fechaHasta },
          summary: { totalResources: 0 },
          byType: {}
        }
      });
    }

    // Agrupar por tipo
    const recursosByType = {};
    allRecursos.forEach(recurso => {
      if (!recursosByType[recurso.tipo]) {
        recursosByType[recurso.tipo] = [];
      }
      recursosByType[recurso.tipo].push(recurso);
    });

    // Analizar cada tipo por separado
    const reportByType = {};
    let globalSummary = {
      totalResources: allRecursos.length,
      totalTexts: 0,
      totalSentences: 0,
      totalCorrectSentences: 0,
      totalTokens: 0,
      totalTypes: 0,
      avgGrammatical: 0,
      avgLexical: 0
    };

    const allGrammaticalScores = [];
    const allLexicalScores = [];

    for (const [tipo, recursos] of Object.entries(recursosByType)) {
      const typeAnalysis = analyzeBatchResourcesSemantics(recursos);
      
      reportByType[tipo] = {
        resourceCount: recursos.length,
        summary: typeAnalysis.summary,
        aggregatedMetrics: typeAnalysis.aggregatedMetrics
      };

      // Solo incluir ejemplos si se solicita
      if (incluirEjemplos === 'true') {
        reportByType[tipo].examples = typeAnalysis.individualAnalyses.slice(0, 3);
      }

      // Agregar a totales globales
      globalSummary.totalTexts += typeAnalysis.aggregatedMetrics.totalTexts;
      globalSummary.totalSentences += typeAnalysis.aggregatedMetrics.totalSentences;
      globalSummary.totalCorrectSentences += typeAnalysis.aggregatedMetrics.totalCorrectSentences;
      globalSummary.totalTokens += typeAnalysis.aggregatedMetrics.totalTokens;
      globalSummary.totalTypes += typeAnalysis.aggregatedMetrics.totalUniqueTypes;
      
      if (typeAnalysis.summary.averageGrammaticalCorrectness > 0) {
        allGrammaticalScores.push(typeAnalysis.summary.averageGrammaticalCorrectness);
      }
      if (typeAnalysis.summary.averageLexicalRichness > 0) {
        allLexicalScores.push(typeAnalysis.summary.averageLexicalRichness);
      }
    }

    // Calcular promedios globales
    globalSummary.avgGrammatical = allGrammaticalScores.length > 0 ? 
      Math.round(allGrammaticalScores.reduce((a, b) => a + b, 0) / allGrammaticalScores.length) : 0;
    
    globalSummary.avgLexical = allLexicalScores.length > 0 ?
      Math.round((allLexicalScores.reduce((a, b) => a + b, 0) / allLexicalScores.length) * 100) / 100 : 0;

    globalSummary.globalGrammaticalPercentage = globalSummary.totalSentences > 0 ?
      Math.round((globalSummary.totalCorrectSentences / globalSummary.totalSentences) * 100) : 0;

    globalSummary.globalTTR = globalSummary.totalTokens > 0 ?
      Math.round((globalSummary.totalTypes / globalSummary.totalTokens) * 100) / 100 : 0;

    // Determinar calidad general
    const combinedScore = (globalSummary.avgGrammatical * 0.6) + (globalSummary.avgLexical * 100 * 0.4);
    let qualityLevel = 'Necesita mejora';
    if (combinedScore >= 80) qualityLevel = 'Excelente';
    else if (combinedScore >= 70) qualityLevel = 'Bueno';
    else if (combinedScore >= 60) qualityLevel = 'Regular';
    else if (combinedScore >= 50) qualityLevel = 'Mejorable';

    res.json({
      success: true,
      data: {
        reportDate: new Date().toISOString(),
        period: {
          fechaDesde: fechaDesde || 'Sin límite',
          fechaHasta: fechaHasta || 'Sin límite'
        },
        globalSummary: {
          ...globalSummary,
          overallQuality: qualityLevel,
          combinedScore: Math.round(combinedScore)
        },
        byResourceType: reportByType,
        insights: generateInsights(reportByType, globalSummary)
      }
    });
  } catch (error) {
    console.error('Error al generar reporte semántico:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Genera insights automáticos basados en las métricas
 */
function generateInsights(reportByType, globalSummary) {
  const insights = [];
  
  // Insight sobre calidad gramatical
  if (globalSummary.avgGrammatical >= 80) {
    insights.push({
      type: 'positive',
      category: 'Gramática',
      message: `Excelente calidad gramatical promedio: ${globalSummary.avgGrammatical}%`
    });
  } else if (globalSummary.avgGrammatical < 60) {
    insights.push({
      type: 'warning',
      category: 'Gramática',
      message: `La calidad gramatical promedio (${globalSummary.avgGrammatical}%) necesita mejora`
    });
  }

  // Insight sobre riqueza léxica
  if (globalSummary.avgLexical >= 0.6) {
    insights.push({
      type: 'positive',
      category: 'Vocabulario',
      message: `Buena riqueza léxica promedio: ${globalSummary.avgLexical}`
    });
  } else if (globalSummary.avgLexical < 0.4) {
    insights.push({
      type: 'warning',
      category: 'Vocabulario',
      message: `La riqueza léxica promedio (${globalSummary.avgLexical}) podría mejorar con mayor variedad de vocabulario`
    });
  }

  // Insight sobre tipos de recursos
  const typeScores = Object.entries(reportByType).map(([tipo, data]) => ({
    tipo,
    grammar: data.summary.averageGrammaticalCorrectness,
    lexical: data.summary.averageLexicalRichness,
    count: data.resourceCount
  }));

  const bestType = typeScores.reduce((best, current) => 
    (current.grammar + current.lexical * 100) > (best.grammar + best.lexical * 100) ? current : best
  );

  const worstType = typeScores.reduce((worst, current) => 
    (current.grammar + current.lexical * 100) < (worst.grammar + worst.lexical * 100) ? current : worst
  );

  if (typeScores.length > 1) {
    insights.push({
      type: 'info',
      category: 'Tipos de recursos',
      message: `Mejor rendimiento: "${bestType.tipo}" (${bestType.count} recursos). Menor rendimiento: "${worstType.tipo}" (${worstType.count} recursos)`
    });
  }

  // Insight sobre volumen
  if (globalSummary.totalResources > 100) {
    insights.push({
      type: 'positive',
      category: 'Volumen',
      message: `Gran volumen de datos analizados: ${globalSummary.totalResources} recursos, ${globalSummary.totalSentences} oraciones`
    });
  }

  return insights;
}

// Nuevo: Analizar recursos del usuario autenticado
export const getMyResourcesReport = async (req, res) => {
  try {
    const userId = req.user.id; // Del token JWT
    
    // Buscar recursos sin include para evitar problemas de asociación
    const recursos = await Recurso.findAll({
      where: { usuarioId: userId }
    });

    // Buscar información del usuario por separado
    const usuario = await Usuario.findByPk(userId);

    if (recursos.length === 0) {
      return res.json({
        success: true,
        data: {
          user: usuario?.nombre || req.user.nombre || 'Usuario',
          userId: userId,
          totalResources: 0,
          metrics: {
            averageGrammar: 0,
            averageTTR: 0,
            overallQuality: 'Sin recursos'
          },
          breakdown: {
            excellent: 0,
            good: 0,
            regular: 0,
            poor: 0
          }
        }
      });
    }

    // Analizar cada recurso usando las funciones existentes
    let totalGrammar = 0;
    let totalTTR = 0;
    const breakdown = { excellent: 0, good: 0, regular: 0, poor: 0 };

    for (const recurso of recursos) {
      const analysis = analyzeResourceSemantics(recurso);
      const grammarScore = analysis.grammaticalCorrectness.percentage;
      const ttr = analysis.lexicalRichness.averageTTR;

      totalGrammar += grammarScore;
      totalTTR += ttr;

      // Clasificar calidad
      if (grammarScore > 90 && ttr > 0.7) breakdown.excellent++;
      else if (grammarScore > 80 && ttr > 0.5) breakdown.good++;
      else if (grammarScore > 60 && ttr > 0.3) breakdown.regular++;
      else breakdown.poor++;
    }

    const averageGrammar = Math.round(totalGrammar / recursos.length);
    const averageTTR = parseFloat((totalTTR / recursos.length).toFixed(3));
    
    let overallQuality = 'Deficiente';
    if (averageGrammar > 90 && averageTTR > 0.7) overallQuality = 'Excelente';
    else if (averageGrammar > 80 && averageTTR > 0.5) overallQuality = 'Buena';
    else if (averageGrammar > 60 && averageTTR > 0.3) overallQuality = 'Regular';

    res.json({
      success: true,
      data: {
        user: usuario?.nombre || req.user.nombre || 'Usuario',
        userId: userId,
        totalResources: recursos.length,
        metrics: {
          averageGrammar,
          averageTTR,
          overallQuality
        },
        breakdown
      }
    });

  } catch (error) {
    console.error('Error en análisis de recursos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Nuevo: Analizar recursos de un usuario específico (para admins)
export const getUserResourcesReport = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Buscar recursos sin include
    const recursos = await Recurso.findAll({
      where: { usuarioId: userId }
    });

    // Buscar información del usuario por separado
    const usuario = await Usuario.findByPk(userId);

    if (recursos.length === 0) {
      return res.json({
        success: true,
        data: {
          user: usuario?.nombre || 'Usuario no encontrado',
          userId: parseInt(userId),
          totalResources: 0,
          metrics: {
            averageGrammar: 0,
            averageTTR: 0,
            overallQuality: 'Sin recursos'
          },
          breakdown: {
            excellent: 0,
            good: 0,
            regular: 0,
            poor: 0
          }
        }
      });
    }

    // Analizar cada recurso usando las funciones existentes
    let totalGrammar = 0;
    let totalTTR = 0;
    const breakdown = { excellent: 0, good: 0, regular: 0, poor: 0 };

    for (const recurso of recursos) {
      const analysis = analyzeResourceSemantics(recurso);
      const grammarScore = analysis.grammaticalCorrectness.percentage;
      const ttr = analysis.lexicalRichness.averageTTR;

      totalGrammar += grammarScore;
      totalTTR += ttr;

      // Clasificar calidad
      if (grammarScore > 90 && ttr > 0.7) breakdown.excellent++;
      else if (grammarScore > 80 && ttr > 0.5) breakdown.good++;
      else if (grammarScore > 60 && ttr > 0.3) breakdown.regular++;
      else breakdown.poor++;
    }

    const averageGrammar = Math.round(totalGrammar / recursos.length);
    const averageTTR = parseFloat((totalTTR / recursos.length).toFixed(3));
    
    let overallQuality = 'Deficiente';
    if (averageGrammar > 90 && averageTTR > 0.7) overallQuality = 'Excelente';
    else if (averageGrammar > 80 && averageTTR > 0.5) overallQuality = 'Buena';
    else if (averageGrammar > 60 && averageTTR > 0.3) overallQuality = 'Regular';

    res.json({
      success: true,
      data: {
        user: usuario?.nombre || 'Usuario',
        userId: parseInt(userId),
        totalResources: recursos.length,
        metrics: {
          averageGrammar,
          averageTTR,
          overallQuality
        },
        breakdown
      }
    });

  } catch (error) {
    console.error('Error en análisis de recursos del usuario específico:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Nuevo: Listar usuarios disponibles para análisis
export const getAvailableUsers = async (req, res) => {
  try {
    // Usar un enfoque más simple
    const allUsers = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email']
    });

    const usersWithResources = [];
    for (const user of allUsers) {
      const resourceCount = await Recurso.count({
        where: { usuarioId: user.id }
      });
      
      if (resourceCount > 0) {
        usersWithResources.push({
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          totalResources: resourceCount
        });
      }
    }

    res.json({
      success: true,
      data: {
        users: usersWithResources,
        totalUsers: usersWithResources.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export default {
  analyzeResourceSemanticsController,
  analyzeBatchSemanticsController,
  getSemanticReportController,
  getMyResourcesReport,
  getUserResourcesReport,
  getAvailableUsers
};
