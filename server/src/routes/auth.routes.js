import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

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

// Validaciones para solicitud de recuperación de contraseña
const validatePasswordResetRequest = [
  body('email').isEmail().withMessage('Debe proporcionar un email válido')
];

// Validaciones para resetear contraseña
const validatePasswordReset = [
  body('email').isEmail().withMessage('Debe proporcionar un email válido'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial')
];

// Rutas de autenticación
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/profile', isAuthenticated, authController.getProfile);

// Rutas de recuperación de contraseña
router.post('/request-password-reset', validatePasswordResetRequest, authController.requestPasswordReset);
router.post('/reset-password', validatePasswordReset, authController.resetPassword);

export default router;