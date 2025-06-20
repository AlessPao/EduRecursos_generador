import express from 'express';
import { body } from 'express-validator';
import * as recursosController from '../controllers/recursos.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recursos
 *   description: Gestión de recursos educativos
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(isAuthenticated);

// Validaciones para crear y actualizar recursos
const validateCreate = [
  body('tipo').isIn(['comprension', 'escritura', 'gramatica', 'oral', 'drag_and_drop', 'ice_breakers'])
    .withMessage('Tipo de recurso inválido'),
  body('titulo').notEmpty().withMessage('El título es obligatorio'),
  body('opciones').isObject().withMessage('Las opciones deben ser un objeto')
];

const validateUpdate = [
  body('titulo').optional(),
  body('contenido').optional().isObject().withMessage('El contenido debe ser un objeto')
];

/**
 * @swagger
 * /recursos:
 *   get:
 *     summary: Obtener todos los recursos del usuario
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de recursos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 recursos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recurso'
 *       401:
 *         description: No autorizado
 *   post:
 *     summary: Crear un nuevo recurso
 *     tags: [Recursos]
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
 *               - tipo
 *               - opciones
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título del recurso
 *                 example: "Comprensión de texto narrativo"
 *               tipo:
 *                 type: string
 *                 enum: [comprension, escritura, gramatica, oral, drag_and_drop, ice_breakers]
 *                 description: Tipo de recurso
 *                 example: "comprension"
 *               opciones:
 *                 type: object
 *                 description: Opciones específicas del tipo de recurso
 *                 example: { "tema": "Animales", "longitud": "200" }
 *     responses:
 *       201:
 *         description: Recurso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 recurso:
 *                   $ref: '#/components/schemas/Recurso'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /recursos/{id}:
 *   get:
 *     summary: Obtener un recurso específico
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso
 *     responses:
 *       200:
 *         description: Recurso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 recurso:
 *                   $ref: '#/components/schemas/Recurso'
 *       404:
 *         description: Recurso no encontrado
 *       401:
 *         description: No autorizado
 *   put:
 *     summary: Actualizar un recurso
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Nuevo título del recurso
 *               contenido:
 *                 type: object
 *                 description: Nuevo contenido del recurso
 *     responses:
 *       200:
 *         description: Recurso actualizado
 *       404:
 *         description: Recurso no encontrado
 *       401:
 *         description: No autorizado
 *   delete:
 *     summary: Eliminar un recurso
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso
 *     responses:
 *       200:
 *         description: Recurso eliminado
 *       404:
 *         description: Recurso no encontrado
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /recursos/{id}/pdf:
 *   get:
 *     summary: Generar y descargar PDF del recurso
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso
 *     responses:
 *       200:
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Recurso no encontrado
 *       401:
 *         description: No autorizado
 */

// Rutas para recursos
router.get('/', recursosController.getRecursos);
router.get('/:id', recursosController.getRecursoById);
router.post('/', validateCreate, recursosController.createRecurso);
router.put('/:id', validateUpdate, recursosController.updateRecurso);
router.delete('/:id', recursosController.deleteRecurso);
router.get('/:id/pdf', recursosController.generatePdf);

export default router;