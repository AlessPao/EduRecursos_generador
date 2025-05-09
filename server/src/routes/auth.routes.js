import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validaciones para registro
const validateRegister = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Debe proporcionar un email válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Validaciones para login
const validateLogin = [
  body('email').isEmail().withMessage('Debe proporcionar un email válido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

// Rutas de autenticación
router.post('/register', isNotAuthenticated, validateRegister, authController.register);
router.post('/login', isNotAuthenticated, validateLogin, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/profile', isAuthenticated, authController.getProfile);

export default router;