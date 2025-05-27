import { validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import RecoveryCode from '../models/RecoveryCode.js';
import jwt from 'jsonwebtoken';
import { sendRecoveryCode } from '../services/email.service.js';
import { Op } from 'sequelize';

// Registrar un nuevo usuario
export const register = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nombre, email, password } = req.body;

    // Verificar si el email ya está en uso
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Crear nuevo usuario
    const usuario = await Usuario.create({
      nombre,
      email,
      password
    });

    // Responder sin incluir la contraseña
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Iniciar sesión
export const login = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.validarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email },
      process.env.JWT_SECRET, // Usar JWT_SECRET
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token, // Enviar el token al cliente
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cerrar sesión
export const logout = (req, res) => {
  // Con JWT, el logout es principalmente manejado en el cliente (borrando el token).
  // Opcionalmente, se puede implementar una blacklist de tokens en el servidor.
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada correctamente (token invalidado en el cliente)'
  });
};

// Obtener perfil del usuario actual
export const getProfile = async (req, res, next) => {
  try {
    // El userId se obtiene del token decodificado en el middleware isAuthenticated
    const userId = req.user.userId; 
    
    const usuario = await Usuario.findByPk(userId, {
      attributes: ['id', 'nombre', 'email', 'createdAt']
    });
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      usuario
    });
  } catch (error) {
    next(error);
  }
};

// Generar código de recuperación de contraseña
export const requestPasswordReset = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({
        success: true,
        message: 'Si el correo está registrado, recibirás un código de recuperación'
      });
    }

    // Invalidar códigos anteriores para este email
    await RecoveryCode.update(
      { used: true },
      { where: { email, used: false } }
    );

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Crear nuevo código de recuperación (expira en 15 minutos)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await RecoveryCode.create({
      email,
      code,
      expiresAt
    });

    // Enviar email con el código
    await sendRecoveryCode(email, code);

    res.status(200).json({
      success: true,
      message: 'Si el correo está registrado, recibirás un código de recuperación'
    });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    next(error);
  }
};

// Verificar código de recuperación y cambiar contraseña
export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, code, newPassword } = req.body;

    // Buscar el código de recuperación
    const recoveryCode = await RecoveryCode.findOne({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!recoveryCode) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      });
    }

    // Buscar el usuario
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar la contraseña
    usuario.password = newPassword;
    await usuario.save();

    // Marcar el código como usado
    recoveryCode.used = true;
    await recoveryCode.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    next(error);
  }
};