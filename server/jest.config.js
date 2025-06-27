export default {
  // Entorno de testing
  testEnvironment: 'node',
  
  // Archivos de prueba
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Configuración para ES modules
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Cobertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**'
  ],
  
  // Timeout
  testTimeout: 10000,
  
  // Limpiar mocks
  clearMocks: true,
  
  // Verbose
  verbose: true
};
