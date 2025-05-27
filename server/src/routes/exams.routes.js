// filepath: e:\project\server\src\routes\exams.routes.js
import { Router } from 'express';
import { createExam,
         listExams,
         getExam,
         submitExam,
         getExamResults } from '../controllers/exams.controller.js';

const router = Router();

// Crear un nuevo examen (solo literal de comprensión)
router.post('/', createExam);

// Listar todos los exámenes
router.get('/', listExams);

// Obtener examen público por slug
router.get('/:slug', getExam);

// Enviar respuestas de examen y obtener calificación
router.post('/:slug/submit', submitExam);

// Obtener resultados de un examen (para docente)
router.get('/:slug/results', getExamResults);

export default router;
