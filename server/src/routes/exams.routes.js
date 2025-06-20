// filepath: e:\project\server\src\routes\exams.routes.js
import { Router } from 'express';
import { createExam,
         listExams,
         getExam,
         submitExam,
         getExamResults,
         deleteExamResults,
         deleteExam } from '../controllers/exams.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Exámenes
 *   description: Gestión de exámenes y evaluaciones
 */

/**
 * @swagger
 * /exams:
 *   post:
 *     summary: Crear un nuevo examen
 *     tags: [Exámenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - tema
 *               - longitud
 *               - numLiteral
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título del examen
 *                 example: "Examen de Comprensión Lectora"
 *               tipoTexto:
 *                 type: string
 *                 description: Tipo de texto (siempre narrativo)
 *                 example: "narrativo"
 *               tema:
 *                 type: string
 *                 description: Tema del examen
 *                 example: "Animales de la selva"
 *               longitud:
 *                 type: string
 *                 enum: ["100", "200", "300"]
 *                 description: Longitud del texto en palabras
 *                 example: "200"
 *               numLiteral:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Número de preguntas literales
 *                 example: 5
 *     responses:
 *       201:
 *         description: Examen creado exitosamente
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
 *                   example: "Examen creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Exam'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *   get:
 *     summary: Listar exámenes del usuario autenticado
 *     tags: [Exámenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de exámenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exam'
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /exams/{slug}:
 *   get:
 *     summary: Obtener examen público por slug
 *     tags: [Exámenes]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único del examen
 *         example: "examen-comprension-123"
 *     responses:
 *       200:
 *         description: Examen encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Exam'
 *       404:
 *         description: Examen no encontrado
 *   delete:
 *     summary: Eliminar un examen
 *     tags: [Exámenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del examen a eliminar
 *     responses:
 *       200:
 *         description: Examen eliminado exitosamente
 *       404:
 *         description: Examen no encontrado
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /exams/{slug}/submit:
 *   post:
 *     summary: Enviar respuestas de examen
 *     tags: [Exámenes]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del examen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentName
 *               - respuestas
 *               - evalTime
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: Nombre del estudiante
 *                 example: "María García"
 *               respuestas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Respuestas del estudiante
 *                 example: ["a", "b", "c", "a", "b"]
 *               evalTime:
 *                 type: integer
 *                 description: Tiempo de evaluación en segundos
 *                 example: 300
 *     responses:
 *       200:
 *         description: Respuestas enviadas y calificadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 score:
 *                   type: number
 *                   description: Puntuación obtenida
 *                   example: 8.5
 *                 totalQuestions:
 *                   type: integer
 *                   example: 10
 *       404:
 *         description: Examen no encontrado
 */

/**
 * @swagger
 * /exams/{slug}/results:
 *   get:
 *     summary: Obtener resultados de un examen
 *     tags: [Exámenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del examen
 *     responses:
 *       200:
 *         description: Resultados del examen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       studentName:
 *                         type: string
 *                         example: "María García"
 *                       score:
 *                         type: number
 *                         example: 8.5
 *                       evalTime:
 *                         type: integer
 *                         example: 300
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Examen no encontrado
 *   delete:
 *     summary: Eliminar todos los resultados de un examen
 *     tags: [Exámenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del examen
 *     responses:
 *       200:
 *         description: Resultados eliminados exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Examen no encontrado
 */

// Crear un nuevo examen (solo literal de comprensión) - Requiere autenticación
router.post('/', isAuthenticated, createExam);

// Listar todos los exámenes del usuario autenticado - Requiere autenticación
router.get('/', isAuthenticated, listExams);

// Obtener examen público por slug - No requiere autenticación (para estudiantes)
router.get('/:slug', getExam);

// Enviar respuestas de examen y obtener calificación - No requiere autenticación (para estudiantes)
router.post('/:slug/submit', submitExam);

// Obtener resultados de un examen (para docente) - Requiere autenticación
router.get('/:slug/results', isAuthenticated, getExamResults);

// Eliminar resultados de un examen (para docente) - Requiere autenticación
router.delete('/:slug/results', isAuthenticated, deleteExamResults);

// Eliminar un examen (para docente) - Requiere autenticación
router.delete('/:slug', isAuthenticated, deleteExam);

export default router;
