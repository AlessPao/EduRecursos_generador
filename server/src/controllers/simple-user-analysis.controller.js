import { 
  analyzeResourceSemantics, 
  analyzeBatchResourcesSemantics
} from '../services/metrics.service.js';
import Recurso from '../models/Recurso.js';
import Usuario from '../models/Usuario.js';

// Función simplificada para análisis por usuario
export const getSimpleUserReport = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Buscar recursos del usuario
    const recursos = await Recurso.findAll({
      where: { usuarioId: userId }
    });

    // Buscar información del usuario
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

    console.log(`📊 Analizando ${recursos.length} recursos del usuario ${usuario?.nombre}...`);

    // Analizar recursos usando la función existente que ya funciona
    const batchAnalysis = analyzeBatchResourcesSemantics(recursos);
    
    if (!batchAnalysis || !batchAnalysis.summary) {
      throw new Error('Error en el análisis de recursos');
    }

    const summary = batchAnalysis.summary;
    
    // Calcular distribución de calidad basándose en análisis individuales
    const breakdown = { excellent: 0, good: 0, regular: 0, poor: 0 };
    
    if (batchAnalysis.individualAnalyses && batchAnalysis.individualAnalyses.length > 0) {
      batchAnalysis.individualAnalyses.forEach(analysis => {
        if (analysis.overallQuality) {
          const quality = analysis.overallQuality.qualityLevel.toLowerCase();
          if (quality.includes('excelente')) breakdown.excellent++;
          else if (quality.includes('bueno') || quality.includes('buena') || quality.includes('alta')) breakdown.good++;
          else if (quality.includes('media') || quality.includes('regular')) breakdown.regular++;
          else breakdown.poor++;
        }
      });
    } else {
      // Si no hay análisis individuales, estimar basándose en promedios
      const grammarScore = summary.averageGrammaticalCorrectness || 0;
      const lexicalScore = (summary.averageLexicalRichness || 0) * 100;
      const combinedScore = (grammarScore * 0.6) + (lexicalScore * 0.4);
      
      if (combinedScore >= 80) breakdown.excellent = recursos.length;
      else if (combinedScore >= 70) breakdown.good = recursos.length;
      else if (combinedScore >= 60) breakdown.regular = recursos.length;
      else breakdown.poor = recursos.length;
    }

    res.json({
      success: true,
      data: {
        user: usuario?.nombre || 'Usuario',
        userId: parseInt(userId),
        totalResources: recursos.length,
        metrics: {
          averageGrammar: Math.round(summary.averageGrammaticalCorrectness || 0),
          averageTTR: parseFloat((summary.averageLexicalRichness || 0).toFixed(3)),
          overallQuality: summary.overallQuality || 'No determinado'
        },
        breakdown,
        debug: {
          analyzedResources: summary.analyzedResources,
          failedAnalyses: summary.failedAnalyses,
          summaryReceived: summary,
          individualAnalysesCount: batchAnalysis.individualAnalyses ? batchAnalysis.individualAnalyses.length : 0
        }
      }
    });

  } catch (error) {
    console.error('Error en análisis de recursos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Función para listar usuarios
export const getAvailableUsers = async (req, res) => {
  try {
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
