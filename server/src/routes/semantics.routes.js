import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { 
  analyzeResourceSemanticsController, 
  analyzeBatchSemanticsController, 
  getSemanticReportController,
  getMyResourcesReport,
  getUserResourcesReport,
  getAvailableUsers
} from '../controllers/semantics.controller.js';

const router = express.Router();

/**
 * @route GET /api/semantics/resource/:id
 * @description Analiza las métricas semánticas de un recurso específico
 * @access Private
 */
router.get('/resource/:id', isAuthenticated, analyzeResourceSemanticsController);

/**
 * @route GET /api/semantics/batch
 * @description Analiza las métricas semánticas de múltiples recursos
 * @query {string} tipo - Filtrar por tipo de recurso (opcional)
 * @query {number} usuarioId - Filtrar por usuario (opcional)
 * @query {number} limit - Límite de recursos a analizar (default: 50)
 * @query {number} offset - Offset para paginación (default: 0)
 * @query {string} fechaDesde - Fecha desde (YYYY-MM-DD) (opcional)
 * @query {string} fechaHasta - Fecha hasta (YYYY-MM-DD) (opcional)
 * @access Private
 */
router.get('/batch', isAuthenticated, analyzeBatchSemanticsController);

/**
 * @route GET /api/semantics/report
 * @description Genera un reporte detallado de métricas semánticas
 * @query {string} fechaDesde - Fecha desde (YYYY-MM-DD) (opcional)
 * @query {string} fechaHasta - Fecha hasta (YYYY-MM-DD) (opcional)
 * @query {boolean} incluirEjemplos - Incluir ejemplos en el reporte (default: false)
 * @access Private
 */
router.get('/report', isAuthenticated, getSemanticReportController);

/**
 * @route GET /api/semantics/my-report
 * @description Analiza las métricas semánticas de los recursos del usuario autenticado
 * @access Private
 */
router.get('/my-report', isAuthenticated, getMyResourcesReport);

/**
 * @route GET /api/semantics/user/:userId/report
 * @description Analiza las métricas semánticas de los recursos de un usuario específico
 * @access Private
 */
router.get('/user/:userId/report', isAuthenticated, getUserResourcesReport);

/**
 * @route GET /api/semantics/users
 * @description Lista los usuarios disponibles para análisis
 * @access Private
 */
router.get('/users', isAuthenticated, getAvailableUsers);

export default router;
