import { validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';

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
      process.env.SESSION_SECRET, // Reutilizamos SESSION_SECRET como JWT_SECRET por ahora
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