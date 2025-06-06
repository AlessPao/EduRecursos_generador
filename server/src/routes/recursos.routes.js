import express from 'express';
import { body } from 'express-validator';
import * as recursosController from '../controllers/recursos.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

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

// Rutas para recursos
router.get('/', recursosController.getRecursos);
router.get('/:id', recursosController.getRecursoById);
router.post('/', validateCreate, recursosController.createRecurso);
router.put('/:id', validateUpdate, recursosController.updateRecurso);
router.delete('/:id', recursosController.deleteRecurso);
router.get('/:id/pdf', recursosController.generatePdf);

export default router;