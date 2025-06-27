import dotenv from 'dotenv';
import { jest } from '@jest/globals';

// Cargar variables de entorno de prueba
dotenv.config({ path: '.env.test' });

// Mock de console.log para pruebas más limpias
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configurar timeout global para pruebas de base de datos
jest.setTimeout(10000);

// Variables globales para pruebas
global.testConfig = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:5000/api',
  dbUrl: process.env.TEST_DB_URL || process.env.db_url,
  jwtSecret: process.env.JWT_SECRET,
  testUser: {
    email: 'test@example.com',
    password: 'password123',
    nombre: 'Usuario Test'
  }
};

// Función helper para limpiar la base de datos después de cada prueba
global.cleanupDatabase = async () => {
  // Esta función se implementará cuando configuremos las pruebas de base de datos
  console.log('Database cleanup - implementar cuando sea necesario');
};

export default global;
