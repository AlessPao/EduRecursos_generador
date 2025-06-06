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
