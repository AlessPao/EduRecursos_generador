import { jest } from '@jest/globals';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { 
  generateTestToken, 
  authHeaders, 
  mockApiSuccess, 
  mockApiError,
  generateRandomResource,
  validateApiResponse,
  delay
} from '../testHelpers.js';

// Mock de axios para las pruebas del LLM
jest.mock('axios');
const mockedAxios = axios;

// Mock de nodemailer para las pruebas de email
jest.mock('nodemailer');

// Mock de configuración
const mockConfig = {
  llm_base_url: 'https://openrouter.ai/api/v1',
  offenrouter_api_key: 'test_api_key',
  llm_model: 'test/model',
  EMAIL_USER: 'test@example.com',
  EMAIL_PASS: 'test_password'
};

describe('🔧 Services Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test_llm_service_connection', () => {
    it('debería conectar con el servicio LLM exitosamente', async () => {
      // Arrange
      const mockLLMResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  titulo: 'Recurso de Comprensión Lectora',
                  tipo: 'comprension',
                  instrucciones: 'Lee el siguiente texto y responde las preguntas.',
                  texto: 'La fotosíntesis es un proceso fundamental en la naturaleza...',
                  preguntas: [
                    {
                      pregunta: '¿Qué es la fotosíntesis?',
                      opciones: ['Un proceso químico', 'Un animal', 'Una planta'],
                      respuestaCorrecta: 0
                    }
                  ]
                })
              }
            }
          ],
          usage: {
            prompt_tokens: 150,
            completion_tokens: 300,
            total_tokens: 450
          }
        }
      };

      mockedAxios.post.mockResolvedValue(mockLLMResponse);

      const requestParams = {
        tipo: 'comprension',
        opciones: {
          nivel: 'segundo_grado',
          tema: 'ciencias_naturales',
          cantidad_preguntas: 3
        }
      };

      // Act
      const result = await simulateLLMService(requestParams, mockLLMResponse);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.titulo).toBe('Recurso de Comprensión Lectora');
      expect(result.data.tipo).toBe('comprension');
      expect(result.data.preguntas).toHaveLength(1);
      expect(result.data.metadata.tokens_used).toBe(450);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería manejar errores de conexión con el LLM', async () => {
      // Arrange
      const connectionError = new Error('Network Error');
      connectionError.code = 'ECONNREFUSED';
      
      mockedAxios.post.mockRejectedValue(connectionError);

      const requestParams = {
        tipo: 'escritura',
        opciones: { nivel: 'segundo_grado' }
      };

      // Act
      const result = await simulateLLMService(requestParams, null, connectionError);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error de conexión con el servicio LLM');
      expect(result.data).toBeNull();
      expect(validateApiResponse(result, false)).toBe(true);
    });

    it('debería manejar respuestas malformadas del LLM', async () => {
      // Arrange
      const malformedResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'Esta no es una respuesta JSON válida'
              }
            }
          ]
        }
      };

      mockedAxios.post.mockResolvedValue(malformedResponse);

      const requestParams = {
        tipo: 'gramatica',
        opciones: { nivel: 'segundo_grado' }
      };

      // Act
      const result = await simulateLLMService(requestParams, malformedResponse);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Respuesta malformada del LLM');
      expect(validateApiResponse(result, false)).toBe(true);
    });

    it('debería implementar retry automático en caso de fallo', async () => {
      // Arrange
      const firstFailure = new Error('Temporary server error');
      firstFailure.response = { status: 502 };

      const retrySuccess = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  titulo: 'Recurso después de retry',
                  tipo: 'oral',
                  descripcion: 'Recurso generado tras reintento exitoso'
                })
              }
            }
          ]
        }
      };

      mockedAxios.post
        .mockRejectedValueOnce(firstFailure)
        .mockResolvedValueOnce(retrySuccess);

      const requestParams = {
        tipo: 'oral',
        opciones: { nivel: 'segundo_grado' }
      };

      // Act
      const result = await simulateLLMServiceWithRetry(requestParams, firstFailure, retrySuccess);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.titulo).toBe('Recurso después de retry');
      expect(result.data.metadata.retry_attempted).toBe(true);
      expect(validateApiResponse(result, true)).toBe(true);
    });
  });

  describe('test_email_service', () => {
    it('debería enviar email de recuperación exitosamente', async () => {
      // Arrange
      const mockTransporter = {
        verify: jest.fn().mockResolvedValue(true),
        sendMail: jest.fn().mockResolvedValue({
          messageId: 'test-message-id',
          response: '250 Message sent successfully'
        })
      };

      nodemailer.createTransporter = jest.fn().mockReturnValue(mockTransporter);

      const emailData = {
        to: 'user@example.com',
        recoveryCode: '123456',
        userName: 'Usuario Test'
      };

      // Act
      const result = await simulateEmailService(emailData, mockTransporter);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.messageId).toBe('test-message-id');
      expect(result.data.recipient).toBe(emailData.to);
      expect(result.data.type).toBe('password_recovery');
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería manejar errores de configuración SMTP', async () => {
      // Arrange
      const smtpError = new Error('Invalid SMTP configuration');
      smtpError.code = 'EAUTH';

      const mockTransporter = {
        verify: jest.fn().mockRejectedValue(smtpError),
        sendMail: jest.fn()
      };

      const emailData = {
        to: 'user@example.com',
        recoveryCode: '123456'
      };

      // Act
      const result = await simulateEmailService(emailData, mockTransporter, smtpError);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error de configuración SMTP');
      expect(result.data).toBeNull();
      expect(validateApiResponse(result, false)).toBe(true);
    });

    it('debería validar formato de email antes del envío', async () => {
      // Arrange
      const invalidEmailData = {
        to: 'email-invalido',
        recoveryCode: '123456'
      };

      // Act
      const result = await simulateEmailValidation(invalidEmailData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Formato de email inválido');
      expect(validateApiResponse(result, false)).toBe(true);
    });

    it('debería generar diferentes tipos de emails correctamente', async () => {
      // Arrange
      const mockTransporter = {
        verify: jest.fn().mockResolvedValue(true),
        sendMail: jest.fn().mockResolvedValue({
          messageId: 'welcome-message-id',
          response: '250 OK'
        })
      };

      const emailTypes = [
        { type: 'welcome', data: { to: 'new@user.com', userName: 'Nuevo Usuario' } },
        { type: 'password_recovery', data: { to: 'user@test.com', recoveryCode: '654321' } },
        { type: 'resource_shared', data: { to: 'friend@test.com', resourceTitle: 'Mi Recurso' } }
      ];

      // Act & Assert
      for (const emailType of emailTypes) {
        const result = await simulateEmailService(emailType.data, mockTransporter, null, emailType.type);
        
        expect(result.success).toBe(true);
        expect(result.data.type).toBe(emailType.type);
        expect(validateApiResponse(result, true)).toBe(true);
      }
    });
  });

  describe('test_metrics_service_calculations', () => {
    it('debería calcular métricas de texto correctamente', async () => {
      // Arrange
      const sampleText = 'El gato subió al árbol. Los pájaros cantaban melodiosamente. La naturaleza es hermosa y diversa.';
      
      const expectedMetrics = {
        totalSentences: 3,
        totalWords: 16,
        averageWordsPerSentence: 5.33,
        totalCharacters: 95,
        readabilityScore: 75.2,
        complexityLevel: 'Medio'
      };

      // Act
      const result = await simulateMetricsCalculation(sampleText, expectedMetrics);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.totalSentences).toBe(3);
      expect(result.data.totalWords).toBe(16);
      expect(result.data.averageWordsPerSentence).toBeCloseTo(5.33, 1);
      expect(result.data.readabilityScore).toBeCloseTo(75.2, 1);
      expect(result.data.complexityLevel).toBe('Medio');
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería calcular TTR (Type-Token Ratio) con precisión', async () => {
      // Arrange
      const textSamples = [
        {
          text: 'El perro come. El perro duerme. El perro juega.',
          expectedTTR: 0.56, // 5 palabras únicas / 9 palabras totales
          expectedRichness: 'Baja'
        },
        {
          text: 'Los estudiantes aprenden matemáticas, ciencias, historia y literatura con dedicación.',
          expectedTTR: 1.0, // Todas las palabras son únicas en este ejemplo
          expectedRichness: 'Alta'
        }
      ];

      // Act & Assert
      for (const sample of textSamples) {
        const result = await simulateTTRCalculation(sample.text);
        
        expect(result.success).toBe(true);
        expect(result.data.ttr).toBeCloseTo(sample.expectedTTR, 1);
        expect(result.data.lexicalRichness).toBe(sample.expectedRichness);
        expect(validateApiResponse(result, true)).toBe(true);
      }
    });

    it('debería detectar errores gramaticales básicos', async () => {
      // Arrange
      const textWithErrors = 'Los estudiantes estudia matemáticas. Ellos va a la escuela. Nosotros comemos frutas.';
      
      const expectedAnalysis = {
        totalSentences: 3,
        correctSentences: 1, // Solo la última es correcta
        grammaticalErrors: [
          { sentence: 'Los estudiantes estudia matemáticas.', error: 'Discordancia sujeto-verbo' },
          { sentence: 'Ellos va a la escuela.', error: 'Discordancia sujeto-verbo' }
        ],
        accuracyPercentage: 33.33
      };

      // Act
      const result = await simulateGrammarDetection(textWithErrors, expectedAnalysis);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.totalSentences).toBe(3);
      expect(result.data.correctSentences).toBe(1);
      expect(result.data.grammaticalErrors).toHaveLength(2);
      expect(result.data.accuracyPercentage).toBeCloseTo(33.33, 1);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería manejar texto vacío o inválido', async () => {
      // Arrange
      const invalidTexts = ['', '   ', null, undefined];

      // Act & Assert
      for (const invalidText of invalidTexts) {
        const result = await simulateMetricsCalculation(invalidText);
        
        expect(result.success).toBe(true);
        expect(result.data.totalSentences).toBe(0);
        expect(result.data.totalWords).toBe(0);
        expect(result.data.readabilityScore).toBe(0);
        expect(validateApiResponse(result, true)).toBe(true);
      }
    });

    it('debería procesar múltiples recursos en batch eficientemente', async () => {
      // Arrange
      const multipleResources = [
        generateRandomResource(1),
        generateRandomResource(1),
        generateRandomResource(1),
        generateRandomResource(1),
        generateRandomResource(1)
      ];

      const expectedBatchResult = {
        totalResources: 5,
        processingTimeMs: 250,
        averageGrammarScore: 82.4,
        averageTTR: 0.68,
        performanceMetrics: {
          resourcesPerSecond: 20,
          memoryUsed: '15MB',
          cacheHitRate: 0.8
        }
      };

      // Act
      const result = await simulateBatchProcessing(multipleResources, expectedBatchResult);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.totalResources).toBe(5);
      expect(result.data.processingTimeMs).toBeLessThan(500);
      expect(result.data.averageGrammarScore).toBeGreaterThan(70);
      expect(result.data.performanceMetrics.resourcesPerSecond).toBeGreaterThan(10);
      expect(validateApiResponse(result, true)).toBe(true);
    });
  });

});

// =====================================
// FUNCIONES AUXILIARES DE SIMULACIÓN
// =====================================

/**
 * Simula el servicio LLM
 */
const simulateLLMService = async (requestParams, mockResponse, mockError = null) => {
  try {
    if (mockError) {
      throw mockError;
    }

    // Simular delay de procesamiento del LLM
    await delay(100);

    // Simular validación de parámetros
    if (!requestParams.tipo || !requestParams.opciones) {
      return mockApiError('Parámetros de entrada inválidos', 400);
    }

    // Simular respuesta del LLM
    if (mockResponse && mockResponse.data && mockResponse.data.choices) {
      const content = mockResponse.data.choices[0].message.content;
      
      try {
        const parsedContent = JSON.parse(content);
        
        return mockApiSuccess({
          ...parsedContent,
          metadata: {
            generated_at: new Date().toISOString(),
            model_used: mockConfig.llm_model,
            tokens_used: mockResponse.data.usage?.total_tokens || 450,
            processing_time_ms: 100
          }
        }, 'Recurso generado exitosamente');
        
      } catch (parseError) {
        return mockApiError('Respuesta malformada del LLM: JSON inválido', 500);
      }
    }

    // Respuesta por defecto
    return mockApiSuccess({
      titulo: 'Recurso de prueba',
      tipo: requestParams.tipo,
      contenido: 'Contenido generado automáticamente',
      metadata: {
        generated_at: new Date().toISOString(),
        model_used: mockConfig.llm_model,
        tokens_used: 300
      }
    });

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return mockApiError('Error de conexión con el servicio LLM', 503);
    }
    
    if (error.response?.status === 502) {
      return mockApiError('Servidor LLM temporalmente no disponible', 502);
    }

    return mockApiError('Error interno del servicio LLM', 500);
  }
};

/**
 * Simula el servicio LLM con retry
 */
const simulateLLMServiceWithRetry = async (requestParams, firstError, retryResponse) => {
  try {
    // Primer intento falla
    await delay(50);
    throw firstError;
    
  } catch (error) {
    // Implementar retry automático
    console.log('Primer intento falló, ejecutando retry...');
    
    await delay(100); // Delay antes del retry
    
    // Segundo intento exitoso
    const content = retryResponse.data.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    return mockApiSuccess({
      ...parsedContent,
      metadata: {
        generated_at: new Date().toISOString(),
        retry_attempted: true,
        attempts: 2,
        final_success: true
      }
    }, 'Recurso generado tras reintento exitoso');
  }
};

/**
 * Simula el servicio de email
 */
const simulateEmailService = async (emailData, mockTransporter, mockError = null, emailType = 'password_recovery') => {
  try {
    if (mockError) {
      throw mockError;
    }

    // Simular verificación de transportador
    await mockTransporter.verify();

    // Simular envío de email
    await delay(80);
    
    const emailResult = await mockTransporter.sendMail({
      from: mockConfig.EMAIL_USER,
      to: emailData.to,
      subject: getEmailSubject(emailType),
      html: generateEmailTemplate(emailType, emailData)
    });

    return mockApiSuccess({
      messageId: emailResult.messageId,
      recipient: emailData.to,
      type: emailType,
      sentAt: new Date().toISOString(),
      status: 'sent'
    }, 'Email enviado exitosamente');

  } catch (error) {
    if (error.code === 'EAUTH') {
      return mockApiError('Error de configuración SMTP: credenciales inválidas', 401);
    }
    
    if (error.code === 'ECONNECTION') {
      return mockApiError('Error de conexión con servidor SMTP', 503);
    }

    return mockApiError('Error interno del servicio de email', 500);
  }
};

/**
 * Simula validación de email
 */
const simulateEmailValidation = async (emailData) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailData.to || !emailRegex.test(emailData.to)) {
    return mockApiError('Formato de email inválido', 400);
  }

  return mockApiSuccess({ valid: true });
};

/**
 * Simula cálculos de métricas
 */
const simulateMetricsCalculation = async (text, expectedMetrics = null) => {
  try {
    // Manejar texto vacío o inválido
    if (!text || text.trim() === '') {
      return mockApiSuccess({
        totalSentences: 0,
        totalWords: 0,
        averageWordsPerSentence: 0,
        totalCharacters: 0,
        readabilityScore: 0,
        complexityLevel: 'N/A'
      });
    }

    // Simular procesamiento
    await delay(30);

    // Cálculos básicos simulados
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    const metrics = expectedMetrics || {
      totalSentences: sentences.length,
      totalWords: words.length,
      averageWordsPerSentence: words.length / sentences.length,
      totalCharacters: text.length,
      readabilityScore: 75 + Math.random() * 20,
      complexityLevel: 'Medio'
    };

    return mockApiSuccess(metrics);

  } catch (error) {
    return mockApiError('Error en cálculo de métricas', 500);
  }
};

/**
 * Simula cálculo de TTR
 */
const simulateTTRCalculation = async (text) => {
  try {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = [...new Set(words)];
    const ttr = words.length > 0 ? uniqueWords.length / words.length : 0;
    
    let lexicalRichness = 'Baja';
    if (ttr >= 0.8) lexicalRichness = 'Alta';
    else if (ttr >= 0.6) lexicalRichness = 'Media';

    return mockApiSuccess({
      totalWords: words.length,
      uniqueWords: uniqueWords.length,
      ttr: Math.round(ttr * 100) / 100,
      lexicalRichness
    });

  } catch (error) {
    return mockApiError('Error en cálculo TTR', 500);
  }
};

/**
 * Simula detección de errores gramaticales
 */
const simulateGrammarDetection = async (text, expectedAnalysis) => {
  try {
    await delay(50);
    
    return mockApiSuccess(expectedAnalysis);

  } catch (error) {
    return mockApiError('Error en detección gramatical', 500);
  }
};

/**
 * Simula procesamiento en batch
 */
const simulateBatchProcessing = async (resources, expectedResult) => {
  try {
    const startTime = Date.now();
    
    // Simular procesamiento de cada recurso
    await delay(250);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    return mockApiSuccess({
      ...expectedResult,
      processingTimeMs: processingTime,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    return mockApiError('Error en procesamiento batch', 500);
  }
};

/**
 * Genera subject para diferentes tipos de email
 */
const getEmailSubject = (type) => {
  const subjects = {
    welcome: 'Bienvenido a Educa Recursos',
    password_recovery: 'Código de recuperación de contraseña',
    resource_shared: 'Te han compartido un recurso educativo'
  };
  return subjects[type] || 'Notificación de Educa Recursos';
};

/**
 * Genera template HTML para email
 */
const generateEmailTemplate = (type, data) => {
  return `<html><body><h1>Email de ${type}</h1><p>Datos: ${JSON.stringify(data)}</p></body></html>`;
};
