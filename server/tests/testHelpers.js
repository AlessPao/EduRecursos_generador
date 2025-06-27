import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { testUsers } from './fixtures/testData.js';

/**
 * Genera un token JWT válido para pruebas
 * @param {Object} payload - Datos para incluir en el token
 * @param {string} secret - Clave secreta (opcional)
 * @returns {string} Token JWT
 */
export const generateTestToken = (payload = { userId: 1, email: 'test@example.com' }, secret = 'test_jwt_secret_key_for_testing_only') => {
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

/**
 * Genera un token JWT expirado para pruebas
 * @param {Object} payload - Datos para incluir en el token
 * @returns {string} Token JWT expirado
 */
export const generateExpiredToken = (payload = { userId: 1, email: 'test@example.com' }) => {
  return jwt.sign(payload, 'test_jwt_secret_key_for_testing_only', { expiresIn: '-1h' });
};

/**
 * Genera un hash de contraseña para pruebas
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Hash de la contraseña
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Crea headers de autorización para pruebas
 * @param {string} token - Token JWT (opcional)
 * @returns {Object} Headers con autorización
 */
export const authHeaders = (token = null) => {
  const authToken = token || generateTestToken();
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Mock de respuesta de API exitosa
 * @param {any} data - Datos de respuesta
 * @param {string} message - Mensaje opcional
 * @returns {Object} Estructura de respuesta de API
 */
export const mockApiSuccess = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

/**
 * Mock de respuesta de API con error
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {Object} data - Datos adicionales del error
 * @returns {Object} Estructura de respuesta de error
 */
export const mockApiError = (message = 'Error', statusCode = 400, data = null) => ({
  success: false,
  message,
  statusCode,
  data
});

/**
 * Simula un delay para pruebas asíncronas
 * @param {number} ms - Milisegundos de delay
 * @returns {Promise} Promesa que se resuelve después del delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Función helper para limpiar objetos de propiedades undefined
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} Objeto sin propiedades undefined
 */
export const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

/**
 * Genera datos de usuario aleatorios para pruebas
 * @returns {Object} Usuario de prueba
 */
export const generateRandomUser = () => {
  const randomId = Math.floor(Math.random() * 10000);
  return {
    nombre: `Test User ${randomId}`,
    email: `test${randomId}@example.com`,
    password: 'password123'
  };
};

/**
 * Genera datos de recurso aleatorios para pruebas
 * @param {number} usuarioId - ID del usuario propietario
 * @returns {Object} Recurso de prueba
 */
export const generateRandomResource = (usuarioId = 1) => {
  const randomId = Math.floor(Math.random() * 10000);
  const tipos = ['PDF', 'VIDEO', 'INTERACTIVO', 'AUDIO'];
  
  return {
    titulo: `Recurso Test ${randomId}`,
    descripcion: `Descripción del recurso de prueba ${randomId}`,
    tipo: tipos[Math.floor(Math.random() * tipos.length)],
    contenido: {
      texto: `Este es el contenido de prueba número ${randomId}. Contiene información educativa relevante.`,
      metadata: { generatedId: randomId, testResource: true }
    },
    usuarioId
  };
};

/**
 * Valida la estructura de respuesta de la API
 * @param {Object} response - Respuesta a validar
 * @param {boolean} shouldBeSuccess - Si debería ser exitosa
 * @returns {boolean} True si la estructura es válida
 */
export const validateApiResponse = (response, shouldBeSuccess = true) => {
  const hasBasicStructure = 
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.message === 'string';

  if (!hasBasicStructure) return false;

  if (shouldBeSuccess) {
    return response.success === true && response.data !== undefined;
  } else {
    return response.success === false;
  }
};

export default {
  generateTestToken,
  generateExpiredToken,
  hashPassword,
  authHeaders,
  mockApiSuccess,
  mockApiError,
  delay,
  cleanObject,
  generateRandomUser,
  generateRandomResource,
  validateApiResponse
};
