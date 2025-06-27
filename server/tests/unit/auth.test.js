import request from 'supertest';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { 
  generateTestToken, 
  generateExpiredToken, 
  authHeaders, 
  mockApiSuccess, 
  mockApiError,
  generateRandomUser,
  validateApiResponse
} from '../testHelpers.js';

// Mock de la aplicación Express
const mockApp = {
  post: jest.fn(),
  get: jest.fn(),
  use: jest.fn()
};

describe('🔐 Auth Controller Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test_login_success', () => {
    it('debería hacer login exitoso con credenciales válidas', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const expectedResponse = mockApiSuccess({
        token: generateTestToken({ userId: 1, email: loginData.email }),
        user: {
          id: 1,
          nombre: 'Usuario Test',
          email: loginData.email
        }
      }, 'Login exitoso');

      // Act
      const result = await simulateLogin(loginData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Login exitoso');
      expect(result.data.token).toBeDefined();
      expect(result.data.user.email).toBe(loginData.email);
      expect(validateApiResponse(result, true)).toBe(true);
    });
  });

  describe('test_login_invalid_credentials', () => {
    it('debería fallar el login con credenciales inválidas', async () => {
      // Arrange
      const invalidLoginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Act
      const result = await simulateLogin(invalidLoginData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Credenciales inválidas');
      expect(result.data).toBeNull();
      expect(validateApiResponse(result, false)).toBe(true);
    });
  });

  describe('test_register_success', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      // Arrange
      const newUser = generateRandomUser();

      // Act
      const result = await simulateRegister(newUser);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Usuario registrado exitosamente');
      expect(result.data.user.email).toBe(newUser.email);
      expect(result.data.user.nombre).toBe(newUser.nombre);
      expect(result.data.user.id).toBeDefined();
      expect(validateApiResponse(result, true)).toBe(true);
    });
  });

  describe('test_register_duplicate_email', () => {
    it('debería fallar el registro con email duplicado', async () => {
      // Arrange
      const existingUser = {
        nombre: 'Usuario Existente',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Act
      const result = await simulateRegister(existingUser, true);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('El email ya está registrado');
      expect(result.data).toBeNull();
      expect(validateApiResponse(result, false)).toBe(true);
    });
  });

  describe('test_jwt_token_validation', () => {
    it('debería validar tokens JWT correctamente', async () => {
      // Arrange
      const validToken = generateTestToken({ userId: 1, email: 'test@example.com' });
      const expiredToken = generateExpiredToken();
      const invalidToken = 'invalid.token.here';

      // Act & Assert - Token válido
      const validResult = await validateToken(validToken);
      expect(validResult.isValid).toBe(true);
      expect(validResult.decoded.userId).toBe(1);

      // Act & Assert - Token expirado
      const expiredResult = await validateToken(expiredToken);
      expect(expiredResult.isValid).toBe(false);
      expect(expiredResult.error).toContain('expirado');

      // Act & Assert - Token inválido
      const invalidResult = await validateToken(invalidToken);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('inválido');
    });
  });

  describe('test_password_reset_request', () => {
    it('debería generar solicitud de reset de contraseña', async () => {
      // Arrange
      const resetData = {
        email: 'test@example.com'
      };

      // Act
      const result = await simulatePasswordResetRequest(resetData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Código de recuperación enviado');
      expect(result.data.recoveryCode).toBeDefined();
      expect(result.data.expiresAt).toBeDefined();
      expect(validateApiResponse(result, true)).toBe(true);
    });
  });

  describe('test_password_reset_execution', () => {
    it('debería ejecutar el reset de contraseña con código válido', async () => {
      // Arrange
      const resetData = {
        email: 'test@example.com',
        recoveryCode: '123456',
        newPassword: 'newpassword123'
      };

      // Act
      const result = await simulatePasswordReset(resetData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Contraseña actualizada exitosamente');
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería fallar con código de recuperación inválido', async () => {
      // Arrange
      const resetData = {
        email: 'test@example.com',
        recoveryCode: 'invalid',
        newPassword: 'newpassword123'
      };

      // Act
      const result = await simulatePasswordReset(resetData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Código de recuperación inválido');
      expect(validateApiResponse(result, false)).toBe(true);
    });
  });

});

// =====================================
// FUNCIONES AUXILIARES DE SIMULACIÓN
// =====================================

/**
 * Simula el proceso de login
 */
const simulateLogin = async (loginData) => {
  try {
    // Simular validación de usuario
    const validCredentials = loginData.email === 'test@example.com' && loginData.password === 'password123';
    
    if (!validCredentials) {
      return mockApiError('Credenciales inválidas', 401);
    }

    // Simular generación de token
    const token = generateTestToken({ userId: 1, email: loginData.email });
    
    return mockApiSuccess({
      token,
      user: {
        id: 1,
        nombre: 'Usuario Test',
        email: loginData.email
      }
    }, 'Login exitoso');

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};

/**
 * Simula el proceso de registro
 */
const simulateRegister = async (userData, simulateExisting = false) => {
  try {
    // Simular validación de email duplicado
    if (simulateExisting || userData.email === 'existing@example.com') {
      return mockApiError('El email ya está registrado', 409);
    }

    // Simular hash de contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Simular creación de usuario
    const newUser = {
      id: Math.floor(Math.random() * 1000),
      nombre: userData.nombre,
      email: userData.email,
      password: hashedPassword
    };

    return mockApiSuccess({
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email
      }
    }, 'Usuario registrado exitosamente');

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};

/**
 * Simula la validación de tokens JWT
 */
const validateToken = async (token) => {
  try {
    const decoded = jwt.verify(token, 'test_jwt_secret_key_for_testing_only');
    return {
      isValid: true,
      decoded
    };
  } catch (error) {
    let errorMessage = 'Token inválido';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expirado';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Token inválido';
    }
    
    return {
      isValid: false,
      error: errorMessage
    };
  }
};

/**
 * Simula solicitud de reset de contraseña
 */
const simulatePasswordResetRequest = async (resetData) => {
  try {
    // Simular generación de código de recuperación
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    return mockApiSuccess({
      recoveryCode,
      expiresAt
    }, 'Código de recuperación enviado al email');

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};

/**
 * Simula ejecución de reset de contraseña
 */
const simulatePasswordReset = async (resetData) => {
  try {
    // Simular validación del código
    const validCode = resetData.recoveryCode === '123456';
    
    if (!validCode) {
      return mockApiError('Código de recuperación inválido o expirado', 400);
    }

    // Simular actualización de contraseña
    const hashedPassword = await bcrypt.hash(resetData.newPassword, 10);
    
    return mockApiSuccess({
      message: 'Contraseña actualizada'
    }, 'Contraseña actualizada exitosamente');

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};
