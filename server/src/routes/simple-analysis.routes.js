import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { getSimpleUserReport, getAvailableUsers } from '../controllers/simple-user-analysis.controller.js';

const router = express.Router();

// Listar usuarios disponibles
router.get('/users', isAuthenticated, getAvailableUsers);

// Analizar usuario específico
router.get('/user/:userId', isAuthenticated, getSimpleUserReport);

export default router;
