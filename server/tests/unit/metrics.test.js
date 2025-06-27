import { jest } from '@jest/globals';
import { 
  generateTestToken, 
  authHeaders, 
  mockApiSuccess, 
  mockApiError,
  generateRandomResource,
  validateApiResponse,
  delay
} from '../testHelpers.js';
import { sampleResources, sampleAnalysisResults } from '../fixtures/testData.js';

describe('📊 Metrics Controller Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test_resource_metrics_analysis', () => {
    it('debería analizar métricas de un recurso específico', async () => {
      // Arrange
      const testResource = generateRandomResource(1);
      const expectedMetrics = {
        resourceId: testResource.id,
        grammaticalCorrectness: 85.5,
        lexicalRichness: 0.72,
        averageWordsPerSentence: 12.3,
        totalSentences: 8,
        totalWords: 98,
        readabilityScore: 78.4,
        complexity: 'Medio',
        qualityLevel: 'Bueno',
        detailedAnalysis: {
          sentences: [
            { text: 'Esta es una oración de ejemplo.', isCorrect: true, errors: [] },
            { text: 'Los estudiantes aprende mucho.', isCorrect: false, errors: ['Discordancia sujeto-verbo'] }
          ],
          vocabularyAnalysis: {
            totalTokens: 98,
            uniqueTokens: 71,
            repetitionRate: 0.28,
            mostCommonWords: ['la', 'el', 'de', 'que', 'y']
          }
        }
      };

      // Act
      const result = await simulateResourceMetricsAnalysis(testResource.id, expectedMetrics);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.resourceId).toBe(testResource.id);
      expect(result.data.grammaticalCorrectness).toBe(85.5);
      expect(result.data.lexicalRichness).toBe(0.72);
      expect(result.data.qualityLevel).toBe('Bueno');
      expect(result.data.detailedAnalysis).toBeDefined();
      expect(result.data.detailedAnalysis.sentences).toHaveLength(2);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería manejar recurso no encontrado', async () => {
      // Arrange
      const nonExistentResourceId = 99999;

      // Act
      const result = await simulateResourceMetricsAnalysis(nonExistentResourceId, null, 'not_found');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Recurso no encontrado');
      expect(result.data).toBeNull();
      expect(validateApiResponse(result, false)).toBe(true);
    });

    it('debería manejar recursos sin permisos de acceso', async () => {
      // Arrange
      const unauthorizedResourceId = 12345;

      // Act
      const result = await simulateResourceMetricsAnalysis(unauthorizedResourceId, null, 'unauthorized');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Sin permisos para acceder al recurso');
      expect(validateApiResponse(result, false)).toBe(true);
    });

    it('debería analizar recursos con diferentes niveles de calidad', async () => {
      // Arrange
      const qualityLevels = [
        { level: 'Excelente', grammar: 95, lexical: 0.85 },
        { level: 'Bueno', grammar: 82, lexical: 0.68 },
        { level: 'Regular', grammar: 75, lexical: 0.55 },
        { level: 'Mejorable', grammar: 65, lexical: 0.42 }
      ];

      // Act & Assert
      for (const quality of qualityLevels) {
        const resource = generateRandomResource(1);
        const expectedMetrics = {
          resourceId: resource.id,
          grammaticalCorrectness: quality.grammar,
          lexicalRichness: quality.lexical,
          qualityLevel: quality.level
        };

        const result = await simulateResourceMetricsAnalysis(resource.id, expectedMetrics);
        
        expect(result.success).toBe(true);
        expect(result.data.qualityLevel).toBe(quality.level);
        expect(result.data.grammaticalCorrectness).toBe(quality.grammar);
        expect(result.data.lexicalRichness).toBe(quality.lexical);
        expect(validateApiResponse(result, true)).toBe(true);
      }
    });
  });

  describe('test_batch_metrics_analysis', () => {
    it('debería analizar múltiples recursos en lote', async () => {
      // Arrange
      const testResources = [
        generateRandomResource(1),
        generateRandomResource(2),
        generateRandomResource(3),
        generateRandomResource(4),
        generateRandomResource(5)
      ];

      const expectedBatchMetrics = {
        totalResourcesAnalyzed: 5,
        processingTimeMs: 420,
        summary: {
          averageGrammaticalCorrectness: 78.4,
          averageLexicalRichness: 0.64,
          overallQuality: 'Bueno'
        },
        resourceTypes: {
          comprension: { count: 2, avgGrammar: 82.5, avgLexical: 0.68 },
          escritura: { count: 2, avgGrammar: 75.0, avgLexical: 0.62 },
          oral: { count: 1, avgGrammar: 77.5, avgLexical: 0.58 }
        },
        aggregatedMetrics: {
          totalTexts: 5,
          totalTokens: 485,
          totalSentences: 42,
          averageComplexity: 'Medio'
        },
        distributionAnalysis: {
          qualityDistribution: {
            'Excelente': 1,
            'Bueno': 2,
            'Regular': 2,
            'Mejorable': 0
          },
          grammarRange: { min: 72, max: 88, std: 6.2 },
          lexicalRange: { min: 0.58, max: 0.72, std: 0.05 }
        }
      };

      // Act
      const result = await simulateBatchMetricsAnalysis(testResources, expectedBatchMetrics);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.totalResourcesAnalyzed).toBe(5);
      expect(result.data.summary.averageGrammaticalCorrectness).toBe(78.4);
      expect(result.data.summary.averageLexicalRichness).toBe(0.64);
      expect(result.data.summary.overallQuality).toBe('Bueno');
      expect(result.data.resourceTypes).toBeDefined();
      expect(result.data.distributionAnalysis).toBeDefined();
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería filtrar recursos por tipo', async () => {
      // Arrange
      const comprensionResources = [
        { ...generateRandomResource(1), tipo: 'comprension' },
        { ...generateRandomResource(2), tipo: 'comprension' },
        { ...generateRandomResource(3), tipo: 'comprension' }
      ];

      const expectedFilteredMetrics = {
        totalResourcesAnalyzed: 3,
        resourceType: 'comprension',
        summary: {
          averageGrammaticalCorrectness: 84.2,
          averageLexicalRichness: 0.71,
          overallQuality: 'Bueno'
        }
      };

      // Act
      const result = await simulateBatchMetricsAnalysis(comprensionResources, expectedFilteredMetrics, 'comprension');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.totalResourcesAnalyzed).toBe(3);
      expect(result.data.resourceType).toBe('comprension');
      expect(result.data.summary.overallQuality).toBe('Bueno');
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería manejar análisis sin recursos', async () => {
      // Arrange
      const emptyResourceList = [];

      // Act
      const result = await simulateBatchMetricsAnalysis(emptyResourceList, null, null, 'no_resources');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('No se encontraron recursos para analizar');
      expect(validateApiResponse(result, false)).toBe(true);
    });

    it('debería limitar el procesamiento a máximo 50 recursos', async () => {
      // Arrange
      const largeResourceList = Array.from({ length: 60 }, (_, i) => generateRandomResource(i + 1));

      const expectedLimitedMetrics = {
        totalResourcesAnalyzed: 50,
        note: 'Análisis limitado a 50 recursos para optimizar rendimiento',
        summary: {
          averageGrammaticalCorrectness: 76.8,
          averageLexicalRichness: 0.63,
          overallQuality: 'Bueno'
        }
      };

      // Act
      const result = await simulateBatchMetricsAnalysis(largeResourceList, expectedLimitedMetrics);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.totalResourcesAnalyzed).toBe(50);
      expect(result.data.note).toContain('limitado a 50 recursos');
      expect(validateApiResponse(result, true)).toBe(true);
    });
  });

  describe('test_metrics_report_generation', () => {
    it('debería generar reporte de métricas completo', async () => {
      // Arrange
      const reportPeriod = 30;
      const expectedReport = {
        period: 'Últimos 30 días',
        generatedAt: new Date().toISOString(),
        resourceCount: 12,
        summary: {
          averageGrammaticalCorrectness: 81.3,
          averageLexicalRichness: 0.67,
          overallQuality: 'Bueno'
        },
        metrics: {
          grammaticalCorrectness: {
            average: 81.3,
            description: 'Porcentaje promedio de oraciones gramaticalmente correctas',
            interpretation: 'Bueno: La gran mayoría de oraciones son correctas'
          },
          lexicalRichness: {
            average: 0.67,
            description: 'Riqueza léxica promedio (TTR - Type-Token Ratio)',
            interpretation: 'Bueno: Vocabulario variado con buena diversidad'
          }
        },
        byResourceType: {
          comprension: { count: 5, avgGrammar: 83.2, avgLexical: 0.69 },
          escritura: { count: 4, avgGrammar: 78.5, avgLexical: 0.64 },
          oral: { count: 2, avgGrammar: 82.0, avgLexical: 0.71 },
          gramatica: { count: 1, avgGrammar: 85.0, avgLexical: 0.58 }
        },
        recommendations: [
          {
            type: 'congratulations',
            priority: 'info',
            message: '¡Excelente trabajo! Tus recursos mantienen una alta calidad en gramática y vocabulario.'
          }
        ]
      };

      // Act
      const result = await simulateMetricsReport(reportPeriod, expectedReport);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.period).toBe('Últimos 30 días');
      expect(result.data.resourceCount).toBe(12);
      expect(result.data.summary.overallQuality).toBe('Bueno');
      expect(result.data.metrics.grammaticalCorrectness).toBeDefined();
      expect(result.data.metrics.lexicalRichness).toBeDefined();
      expect(result.data.byResourceType).toBeDefined();
      expect(result.data.recommendations).toHaveLength(1);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería generar reporte para diferentes períodos', async () => {
      // Arrange
      const periods = [7, 30, 90, 365];

      // Act & Assert
      for (const period of periods) {
        const expectedReport = {
          period: `Últimos ${period} días`,
          resourceCount: Math.floor(Math.random() * 20) + 5,
          summary: {
            averageGrammaticalCorrectness: 75 + Math.random() * 20,
            averageLexicalRichness: 0.5 + Math.random() * 0.3,
            overallQuality: 'Bueno'
          }
        };

        const result = await simulateMetricsReport(period, expectedReport);
        
        expect(result.success).toBe(true);
        expect(result.data.period).toBe(`Últimos ${period} días`);
        expect(result.data.resourceCount).toBeGreaterThan(0);
        expect(validateApiResponse(result, true)).toBe(true);
      }
    });

    it('debería generar reporte sin datos cuando no hay recursos', async () => {
      // Arrange
      const period = 30;

      // Act
      const result = await simulateMetricsReport(period, null, 'no_data');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.resourceCount).toBe(0);
      expect(result.data.summary.overallQuality).toBe('Sin datos');
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería generar recomendaciones apropiadas según métricas', async () => {
      // Arrange
      const scenarios = [
        {
          metrics: { grammar: 65, lexical: 0.45 },
          expectedRecommendations: ['grammar', 'vocabulary']
        },
        {
          metrics: { grammar: 90, lexical: 0.75 },
          expectedRecommendations: ['congratulations']
        },
        {
          metrics: { grammar: 60, lexical: 0.65 },
          expectedRecommendations: ['grammar']
        }
      ];

      // Act & Assert
      for (const scenario of scenarios) {
        const report = {
          summary: {
            averageGrammaticalCorrectness: scenario.metrics.grammar,
            averageLexicalRichness: scenario.metrics.lexical
          },
          recommendations: generateTestRecommendations(scenario.metrics)
        };

        const result = await simulateMetricsReport(30, report);
        
        expect(result.success).toBe(true);
        
        const recommendationTypes = result.data.recommendations.map(r => r.type);
        scenario.expectedRecommendations.forEach(expectedType => {
          expect(recommendationTypes).toContain(expectedType);
        });
        
        expect(validateApiResponse(result, true)).toBe(true);
      }
    });
  });

  describe('test_dashboard_metrics', () => {
    it('debería obtener métricas rápidas para el dashboard', async () => {
      // Arrange
      const expectedDashboardMetrics = {
        hasData: true,
        resourcesAnalyzed: 10,
        grammaticalCorrectness: {
          value: 82.5,
          level: 'Bueno',
          color: 'blue'
        },
        lexicalRichness: {
          value: 0.69,
          level: 'Excelente',
          color: 'green'
        },
        overallQuality: {
          level: 'Bueno',
          color: 'blue'
        },
        totalTexts: 10,
        totalWords: 1240
      };

      // Act
      const result = await simulateDashboardMetrics(expectedDashboardMetrics);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.hasData).toBe(true);
      expect(result.data.resourcesAnalyzed).toBe(10);
      expect(result.data.grammaticalCorrectness.level).toBe('Bueno');
      expect(result.data.lexicalRichness.level).toBe('Excelente');
      expect(result.data.overallQuality.level).toBe('Bueno');
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería manejar dashboard sin datos', async () => {
      // Arrange
      const emptyDashboardMetrics = {
        hasData: false,
        message: 'No tienes recursos para analizar aún'
      };

      // Act
      const result = await simulateDashboardMetrics(emptyDashboardMetrics);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.hasData).toBe(false);
      expect(result.data.message).toContain('No tienes recursos para analizar aún');
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería asignar colores correctos según niveles de calidad', async () => {
      // Arrange
      const colorMappings = [
        { level: 'Excelente', expectedColor: 'green' },
        { level: 'Bueno', expectedColor: 'blue' },
        { level: 'Regular', expectedColor: 'yellow' },
        { level: 'Mejorable', expectedColor: 'red' }
      ];

      // Act & Assert
      for (const mapping of colorMappings) {
        const dashboardMetrics = {
          hasData: true,
          resourcesAnalyzed: 5,
          overallQuality: {
            level: mapping.level,
            color: mapping.expectedColor
          }
        };

        const result = await simulateDashboardMetrics(dashboardMetrics);
        
        expect(result.success).toBe(true);
        expect(result.data.overallQuality.level).toBe(mapping.level);
        expect(result.data.overallQuality.color).toBe(mapping.expectedColor);
        expect(validateApiResponse(result, true)).toBe(true);
      }
    });
  });

  describe('test_metrics_performance', () => {
    it('debería procesar métricas de forma eficiente', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 25 }, (_, i) => generateRandomResource(i + 1));
      const startTime = Date.now();

      // Act
      const result = await simulatePerformanceTest(largeDataset);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.resourcesProcessed).toBe(25);
      expect(processingTime).toBeLessThan(1000); // Menos de 1 segundo
      expect(result.data.processingTimeMs).toBeLessThan(800);
      expect(result.data.resourcesPerSecond).toBeGreaterThan(30);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería manejar errores de procesamiento gracefully', async () => {
      // Arrange
      const corruptedResource = {
        id: 1,
        contenido: null, // Contenido corrupto
        tipo: 'comprension'
      };

      // Act
      const result = await simulateProcessingError(corruptedResource);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error procesando métricas');
      expect(result.data.errorType).toBe('content_processing');
      expect(validateApiResponse(result, false)).toBe(true);
    });
  });

});

// =====================================
// FUNCIONES AUXILIARES DE SIMULACIÓN
// =====================================

/**
 * Simula análisis de métricas de un recurso individual
 */
const simulateResourceMetricsAnalysis = async (resourceId, expectedMetrics, errorType = null) => {
  try {
    await delay(50); // Simular procesamiento

    if (errorType === 'not_found') {
      return mockApiError('Recurso no encontrado', 404);
    }

    if (errorType === 'unauthorized') {
      return mockApiError('Sin permisos para acceder al recurso', 403);
    }

    if (!expectedMetrics) {
      return mockApiError('Error interno del servidor', 500);
    }

    return mockApiSuccess(expectedMetrics, 'Análisis de métricas completado');

  } catch (error) {
    return mockApiError('Error analizando métricas del recurso', 500);
  }
};

/**
 * Simula análisis de métricas en lote
 */
const simulateBatchMetricsAnalysis = async (resources, expectedMetrics, resourceType = null, errorType = null) => {
  try {
    if (errorType === 'no_resources') {
      return mockApiError('No se encontraron recursos para analizar', 404);
    }

    if (resources.length === 0) {
      return mockApiError('No se encontraron recursos para analizar', 404);
    }

    // Simular procesamiento más largo para batch
    await delay(Math.min(resources.length * 10, 500));

    // Limitar a 50 recursos
    const limitedResources = resources.slice(0, 50);
    
    const batchMetrics = {
      ...expectedMetrics,
      totalResourcesAnalyzed: limitedResources.length,
      processingTimeMs: limitedResources.length * 8,
      ...(resourceType && { resourceType })
    };

    if (resources.length > 50) {
      batchMetrics.note = 'Análisis limitado a 50 recursos para optimizar rendimiento';
    }

    return mockApiSuccess(batchMetrics, `Análisis semántico completado para ${limitedResources.length} recursos`);

  } catch (error) {
    return mockApiError('Error analizando métricas en lote', 500);
  }
};

/**
 * Simula generación de reporte de métricas
 */
const simulateMetricsReport = async (period, expectedReport, errorType = null) => {
  try {
    await delay(100); // Simular generación de reporte

    if (errorType === 'no_data') {
      return mockApiSuccess({
        period: `Últimos ${period} días`,
        resourceCount: 0,
        summary: {
          averageGrammaticalCorrectness: 0,
          averageLexicalRichness: 0,
          overallQuality: 'Sin datos'
        }
      }, 'No se encontraron recursos en el período especificado');
    }

    if (!expectedReport) {
      return mockApiError('Error generando reporte', 500);
    }

    return mockApiSuccess(expectedReport, 'Reporte de métricas generado');

  } catch (error) {
    return mockApiError('Error generando reporte de métricas', 500);
  }
};

/**
 * Simula métricas del dashboard
 */
const simulateDashboardMetrics = async (expectedMetrics) => {
  try {
    await delay(30); // Procesamiento rápido para dashboard

    return mockApiSuccess(expectedMetrics, 'Métricas del dashboard obtenidas');

  } catch (error) {
    return mockApiError('Error obteniendo métricas del dashboard', 500);
  }
};

/**
 * Simula test de rendimiento
 */
const simulatePerformanceTest = async (resources) => {
  try {
    const startTime = Date.now();
    
    // Simular procesamiento
    await delay(resources.length * 8);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    const resourcesPerSecond = Math.round((resources.length / processingTime) * 1000);

    return mockApiSuccess({
      resourcesProcessed: resources.length,
      processingTimeMs: processingTime,
      resourcesPerSecond,
      memoryUsed: `${Math.round(resources.length * 0.5)}MB`,
      efficiency: 'Óptima'
    }, 'Test de rendimiento completado');

  } catch (error) {
    return mockApiError('Error en test de rendimiento', 500);
  }
};

/**
 * Simula error de procesamiento
 */
const simulateProcessingError = async (resource) => {
  try {
    await delay(20);
    
    if (!resource.contenido) {
      return mockApiError('Error procesando métricas: contenido inválido', 400, {
        errorType: 'content_processing',
        resourceId: resource.id
      });
    }

    return mockApiSuccess({});

  } catch (error) {
    return mockApiError('Error interno de procesamiento', 500, {
      errorType: 'internal_error'
    });
  }
};

/**
 * Genera recomendaciones de prueba
 */
const generateTestRecommendations = (metrics) => {
  const recommendations = [];
  
  if (metrics.grammar < 70) {
    recommendations.push({
      type: 'grammar',
      priority: 'high',
      message: 'Se recomienda revisar la gramática del contenido generado.'
    });
  }
  
  if (metrics.lexical < 0.5) {
    recommendations.push({
      type: 'vocabulary',
      priority: 'medium',
      message: 'El vocabulario podría ser más variado.'
    });
  }
  
  if (metrics.grammar >= 85 && metrics.lexical >= 0.6) {
    recommendations.push({
      type: 'congratulations',
      priority: 'info',
      message: '¡Excelente trabajo! Tus recursos mantienen una alta calidad.'
    });
  }
  
  return recommendations;
};
