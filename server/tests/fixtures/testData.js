// Datos de prueba para usuarios
export const testUsers = [
  {
    id: 1,
    nombre: 'Paolo Test',
    email: 'paolo@test.com',
    password: 'password123'
  },
  {
    id: 2,
    nombre: 'Usuario Test',
    email: 'test@example.com',
    password: 'password123'
  },
  {
    id: 3,
    nombre: 'Admin Test',
    email: 'admin@test.com',
    password: 'admin123'
  }
];

// Datos de prueba para recursos
export const testResources = [
  {
    id: 1,
    titulo: 'Recurso de Matemáticas',
    descripcion: 'Un recurso educativo sobre álgebra básica',
    tipo: 'PDF',
    contenido: {
      texto: 'Este es un contenido de prueba para matemáticas. Incluye ejercicios de álgebra.',
      metadata: { pages: 10, difficulty: 'medium' }
    },
    usuarioId: 1
  },
  {
    id: 2,
    titulo: 'Recurso de Historia',
    descripcion: 'Material sobre la historia de América',
    tipo: 'VIDEO',
    contenido: {
      texto: 'Contenido histórico sobre el descubrimiento de América y sus consecuencias.',
      metadata: { duration: '30:00', language: 'español' }
    },
    usuarioId: 1
  },
  {
    id: 3,
    titulo: 'Recurso de Ciencias',
    descripcion: 'Experimentos de química básica',
    tipo: 'INTERACTIVO',
    contenido: {
      texto: 'Experimentos simples de química que se pueden realizar en casa con materiales básicos.',
      metadata: { experiments: 5, safetyLevel: 'high' }
    },
    usuarioId: 2
  }
];

// Datos de prueba para exámenes
export const testExams = [
  {
    id: 1,
    titulo: 'Examen de Matemáticas Básicas',
    descripcion: 'Evaluación de conocimientos básicos de matemáticas',
    preguntas: [
      {
        pregunta: '¿Cuánto es 2 + 2?',
        opciones: ['3', '4', '5', '6'],
        respuestaCorrecta: 1
      },
      {
        pregunta: '¿Cuál es la raíz cuadrada de 16?',
        opciones: ['2', '4', '6', '8'],
        respuestaCorrecta: 1
      }
    ],
    usuarioId: 1
  }
];

// Tokens JWT de prueba
export const testTokens = {
  validToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoicGFvbG9AdGVzdC5jb20iLCJpYXQiOjE2MzQ4MjczMDB9',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoicGFvbG9AdGVzdC5jb20iLCJpYXQiOjE2MzQ4MjczMDAsImV4cCI6MTYzNDgyNzMwMX0',
  invalidToken: 'invalid.token.here'
};

// Respuestas de análisis semántico de prueba
export const testAnalysisResults = [
  {
    resourceId: 1,
    grammarScore: 85.5,
    ttrScore: 0.72,
    qualityLevel: 'good',
    feedback: 'El contenido tiene buena gramática pero podría mejorar la variedad lexical.'
  },
  {
    resourceId: 2,
    grammarScore: 92.3,
    ttrScore: 0.68,
    qualityLevel: 'excellent',
    feedback: 'Excelente calidad gramatical y buen uso del vocabulario.'
  },
  {
    resourceId: 3,
    grammarScore: 78.1,
    ttrScore: 0.65,
    qualityLevel: 'regular',
    feedback: 'La gramática es aceptable pero hay áreas de mejora.'
  }
];
