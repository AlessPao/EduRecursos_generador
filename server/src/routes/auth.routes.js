import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para manejo de autenticación y usuarios
 */

// Validaciones para registro
const validateRegister = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .custom(value => {
      // No puede empezar con punto
      if (value.startsWith('.')) {
        throw new Error('El correo no puede empezar con punto');
      }
      // No puede tener puntos consecutivos
      if (value.includes('..')) {
        throw new Error('El correo no puede tener puntos consecutivos');
      }
      // Verificar que no empiece con símbolos antes del @
      const localPart = value.split('@')[0];
      if (localPart && !/^[a-zA-Z0-9]/.test(localPart)) {
        throw new Error('El correo no puede empezar con símbolos antes del @');
      }
      // Verificar longitudes
      if (value.length > 320) {
        throw new Error('El correo es demasiado largo (máx. 320 caracteres)');
      }
      if (localPart && localPart.length > 64) {
        throw new Error('La parte local del correo es demasiado larga (máx. 64 caracteres)');
      }
      const domain = value.split('@')[1];
      if (domain && domain.length > 255) {
        throw new Error('El dominio del correo es demasiado largo (máx. 255 caracteres)');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

// Validaciones para login
const validateLogin = [
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .custom(value => {
      // No puede empezar con punto
      if (value.startsWith('.')) {
        throw new Error('El correo no puede empezar con punto');
      }
      // No puede tener puntos consecutivos
      if (value.includes('..')) {
        throw new Error('El correo no puede tener puntos consecutivos');
      }
      // Verificar que no empiece con símbolos antes del @
      const localPart = value.split('@')[0];
      if (localPart && !/^[a-zA-Z0-9]/.test(localPart)) {
        throw new Error('El correo no puede empezar con símbolos antes del @');
      }
      return true;
    }),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

// Validaciones para solicitud de recuperación de contraseña
const validatePasswordResetRequest = [
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .custom(value => {
      // No puede empezar con punto
      if (value.startsWith('.')) {
        throw new Error('El correo no puede empezar con punto');
      }
      // No puede tener puntos consecutivos
      if (value.includes('..')) {
        throw new Error('El correo no puede tener puntos consecutivos');
      }
      // Verificar que no empiece con símbolos antes del @
      const localPart = value.split('@')[0];
      if (localPart && !/^[a-zA-Z0-9]/.test(localPart)) {
        throw new Error('El correo no puede empezar con símbolos antes del @');
      }
      return true;
    })
];

// Validaciones para resetear contraseña
const validatePasswordReset = [
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .custom(value => {
      // No puede empezar con punto
      if (value.startsWith('.')) {
        throw new Error('El correo no puede empezar con punto');
      }
      // No puede tener puntos consecutivos
      if (value.includes('..')) {
        throw new Error('El correo no puede tener puntos consecutivos');
      }
      // Verificar que no empiece con símbolos antes del @
      const localPart = value.split('@')[0];
      if (localPart && !/^[a-zA-Z0-9]/.test(localPart)) {
        throw new Error('El correo no puede empezar con símbolos antes del @');
      }
      return true;
    }),
  body('code').isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

// Validaciones para actualizar perfil
const validateUpdateProfile = [
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('email')
    .optional()
    .isEmail().withMessage('Debe proporcionar un email válido')
    .custom(value => {
      if (value.startsWith('.')) {
        throw new Error('El correo no puede empezar con punto');
      }
      if (value.includes('..')) {
        throw new Error('El correo no puede tener puntos consecutivos');
      }
      const localPart = value.split('@')[0];
      if (localPart && !/^[a-zA-Z0-9]/.test(localPart)) {
        throw new Error('El correo no puede empezar con símbolos antes del @');
      }
      return true;
    }),
  body('currentPassword')
    .optional()
    .notEmpty().withMessage('La contraseña actual es obligatoria si desea cambiarla'),
  body('newPassword')
    .optional()
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

// Validaciones para eliminar cuenta
const validateDeleteAccount = [
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  body('confirmationText')
    .notEmpty().withMessage('Debe escribir el texto de confirmación')
    .equals('ELIMINAR MI CUENTA').withMessage('Debe escribir exactamente "ELIMINAR MI CUENTA"')
];

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *                 example: "juan@example.com"
 *               password:
 *                 type: string
 *                 description: Contraseña (mínimo 8 caracteres)
 *                 example: "MiPassword123!"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El email ya está registrado
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               password:
 *                 type: string
 *                 example: "MiPassword123!"
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                   example: "Login exitoso"
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 *       400:
 *         description: Error de validación
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Solicitar código de recuperación de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *     responses:
 *       200:
 *         description: Código enviado al email
 *       404:
 *         description: Email no encontrado
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Resetear contraseña con código
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               code:
 *                 type: string
 *                 description: Código de 6 dígitos
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña
 *                 example: "NuevoPassword123!"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       400:
 *         description: Código inválido o expirado
 */

// Rutas de autenticación
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/profile', isAuthenticated, authController.getProfile);
router.put('/profile', isAuthenticated, validateUpdateProfile, authController.updateProfile);
router.delete('/account', isAuthenticated, validateDeleteAccount, authController.deleteAccount);

// Rutas de recuperación de contraseña
router.post('/request-password-reset', validatePasswordResetRequest, authController.requestPasswordReset);
router.post('/reset-password', validatePasswordReset, authController.resetPassword);

export default router;