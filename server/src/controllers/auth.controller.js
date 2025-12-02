import { validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import RecoveryCode from '../models/RecoveryCode.js';
import jwt from 'jsonwebtoken';
import { sendRecoveryCode } from '../services/email.service.js';
import { Op } from 'sequelize';
import { formatearTimestampConsentimiento } from '../utils/dateFormatter.js';

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

    const { nombre, email, password, privacyConsentTimestamp } = req.body;

    // Validar que se haya proporcionado el timestamp del consentimiento
    if (!privacyConsentTimestamp) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el consentimiento de privacidad para registrarse'
      });
    }

    // Formatear el timestamp a formato PostgreSQL con zona horaria de Perú
    const formattedTimestamp = formatearTimestampConsentimiento(privacyConsentTimestamp);

    // Verificar si el email ya está en uso
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Crear nuevo usuario con el timestamp del consentimiento formateado
    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      privacyConsentTimestamp: formattedTimestamp
    });

    // Responder sin incluir la contraseña
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        privacyConsentTimestamp: usuario.privacyConsentTimestamp
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
      { expiresIn: '30m' } // El token expira en 30 minutos (requisito de seguridad)
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

// Actualizar perfil del usuario (nombre, email, contraseña)
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { nombre, email, currentPassword, newPassword } = req.body;

    // Buscar el usuario
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si se quiere cambiar el email, verificar que no esté en uso
    if (email && email !== usuario.email) {
      const emailExiste = await Usuario.findOne({ where: { email } });
      if (emailExiste) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está en uso'
        });
      }
      usuario.email = email;
    }

    // Si se proporciona un nombre, actualizarlo
    if (nombre && nombre.trim() !== '') {
      usuario.nombre = nombre;
    }

    // Si se quiere cambiar la contraseña, verificar la contraseña actual
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar la contraseña actual para cambiarla'
        });
      }

      // Verificar la contraseña actual
      const passwordValida = await usuario.validarPassword(currentPassword);
      if (!passwordValida) {
        return res.status(401).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Actualizar la contraseña (el hook beforeUpdate se encarga del hash)
      usuario.password = newPassword;
    }

    // Guardar los cambios
    await usuario.save();

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        createdAt: usuario.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar cuenta del usuario (ARCO - Derecho de Cancelación)
export const deleteAccount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { password, confirmationText } = req.body;

    // Verificar que se proporcionó el texto de confirmación
    if (confirmationText !== 'ELIMINAR MI CUENTA') {
      return res.status(400).json({
        success: false,
        message: 'Debe escribir exactamente "ELIMINAR MI CUENTA" para confirmar'
      });
    }

    // Buscar el usuario
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar la contraseña
    const passwordValida = await usuario.validarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    // Importar modelos relacionados dinámicamente para evitar dependencias circulares
    const { default: Recurso } = await import('../models/Recurso.js');
    const { default: Exam } = await import('../models/Exam.js');
    const { default: ExamResult } = await import('../models/ExamResult.js');

    // Eliminar todos los datos relacionados del usuario
    // 1. Eliminar resultados de exámenes (tanto como estudiante que realizó exámenes)
    await ExamResult.destroy({ where: { usuarioId: userId } });

    // 2. Eliminar exámenes creados por el usuario
    await Exam.destroy({ where: { usuarioId: userId } });

    // 3. Eliminar recursos creados por el usuario
    await Recurso.destroy({ where: { usuarioId: userId } });

    // 4. Finalmente eliminar el usuario
    await usuario.destroy();

    res.status(200).json({
      success: true,
      message: 'Cuenta eliminada correctamente. Todos tus datos han sido borrados permanentemente.'
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
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

    // Enviar email con el código (con timeout)
    try {
      await Promise.race([
        sendRecoveryCode(email, code),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al enviar email')), 15000)
        )
      ]);
    } catch (emailError) {
      console.error('Error al enviar email de recuperación:', emailError);
      // Incluso si falla el email, el código se guardó en la BD
      // El usuario podría intentar de nuevo
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el correo. Por favor, intenta de nuevo en unos momentos.'
      });
    }

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