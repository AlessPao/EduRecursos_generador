import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { 
  analyzeResourceMetrics, 
  analyzeBatchMetrics, 
  getMetricsReport, 
  getDashboardMetrics 
} from '../controllers/metrics.controller.js';

const router = express.Router();

/**
 * @swagger
 * /metrics/resource/{id}:
 *   get:
 *     summary: Analizar métricas semánticas de un recurso específico
 *     tags: [Métricas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso a analizar
 *     responses:
 *       200:
 *         description: Análisis semántico completado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Análisis semántico completado"
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     resourceInfo:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         titulo:
 *                           type: string
 *                         tipo:
 *                           type: string
 *                     grammaticalCorrectness:
 *                       type: object
 *                       properties:
 *                         totalSentences:
 *                           type: integer
 *                         correctSentences:
 *                           type: integer
 *                         percentage:
 *                           type: integer
 *                           description: "Porcentaje de oraciones gramaticalmente correctas"
 *                     lexicalRichness:
 *                       type: object
 *                       properties:
 *                         totalTokens:
 *                           type: integer
 *                         uniqueTypes:
 *                           type: integer
 *                         averageTTR:
 *                           type: number
 *                           description: "Riqueza léxica promedio (Type-Token Ratio)"
 *       404:
 *         description: Recurso no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/resource/:id', isAuthenticated, analyzeResourceMetrics);

/**
 * @swagger
 * /metrics/batch:
 *   get:
 *     summary: Analizar métricas semánticas de múltiples recursos
 *     tags: [Métricas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: resourceIds
 *         schema:
 *           type: string
 *         description: IDs de recursos separados por comas (opcional)
 *         example: "1,2,3"
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *           enum: [comprension, escritura, gramatica, oral, drag_and_drop, ice_breakers]
 *         description: Filtrar por tipo de recurso (opcional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Límite de recursos a analizar
 *     responses:
 *       200:
 *         description: Análisis semántico en lote completado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Análisis semántico completado para 5 recursos"
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalResources:
 *                           type: integer
 *                         averageGrammaticalCorrectness:
 *                           type: integer
 *                           description: "Promedio de corrección gramatical"
 *                         averageLexicalRichness:
 *                           type: number
 *                           description: "Promedio de riqueza léxica (TTR)"
 *                         overallQuality:
 *                           type: string
 *                           enum: [Excelente, Bueno, Regular, Mejorable, "Necesita mejora"]
 *                     aggregatedMetrics:
 *                       type: object
 *                       properties:
 *                         totalSentences:
 *                           type: integer
 *                         globalGrammaticalPercentage:
 *                           type: integer
 *                         totalTokens:
 *                           type: integer
 *                         globalTTR:
 *                           type: number
 *       404:
 *         description: No se encontraron recursos para analizar
 *       401:
 *         description: No autorizado
 */
router.get('/batch', isAuthenticated, analyzeBatchMetrics);

/**
 * @swagger
 * /metrics/report:
 *   get:
 *     summary: Obtener reporte completo de métricas semánticas
 *     tags: [Métricas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Período en días para el reporte
 *         example: 30
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *           enum: [comprension, escritura, gramatica, oral, drag_and_drop, ice_breakers]
 *         description: Filtrar por tipo de recurso (opcional)
 *     responses:
 *       200:
 *         description: Reporte de métricas generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reporte de métricas generado"
 *                 report:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "Últimos 30 días"
 *                     resourceCount:
 *                       type: integer
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         grammaticalCorrectness:
 *                           type: object
 *                           properties:
 *                             average:
 *                               type: integer
 *                             description:
 *                               type: string
 *                             interpretation:
 *                               type: string
 *                         lexicalRichness:
 *                           type: object
 *                           properties:
 *                             average:
 *                               type: number
 *                             description:
 *                               type: string
 *                             interpretation:
 *                               type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           priority:
 *                             type: string
 *                           message:
 *                             type: string
 *       401:
 *         description: No autorizado
 */
router.get('/report', isAuthenticated, getMetricsReport);

/**
 * @swagger
 * /metrics/dashboard:
 *   get:
 *     summary: Obtener métricas rápidas para el dashboard
 *     tags: [Métricas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del dashboard obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     hasData:
 *                       type: boolean
 *                     resourcesAnalyzed:
 *                       type: integer
 *                     grammaticalCorrectness:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                         level:
 *                           type: string
 *                         color:
 *                           type: string
 *                     lexicalRichness:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                         level:
 *                           type: string
 *                         color:
 *                           type: string
 *                     overallQuality:
 *                       type: object
 *                       properties:
 *                         level:
 *                           type: string
 *                         color:
 *                           type: string
 *       401:
 *         description: No autorizado
 */
router.get('/dashboard', isAuthenticated, getDashboardMetrics);

export default router;
