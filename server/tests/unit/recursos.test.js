import { jest } from '@jest/globals';
import { 
  generateTestToken, 
  authHeaders, 
  mockApiSuccess, 
  mockApiError,
  generateRandomResource,
  validateApiResponse,
  generateRandomUser,
  delay
} from '../testHelpers.js';

// Mock del modelo Recurso
const mockRecursoModel = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

// Mock del servicio LLM
const mockLLMService = {
  generarRecurso: jest.fn()
};

describe('📚 Recursos Controller Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test_create_resource', () => {
    it('debería crear un nuevo recurso exitosamente', async () => {
      // Arrange
      const userId = 1;
      const resourceData = {
        tipo: 'comprension',
        titulo: 'Recurso de Comprensión Lectora',
        opciones: {
          nivel: 'medio',
          tema: 'ciencias',
          duracion: '30 minutos'
        }
      };

      const generatedContent = {
        titulo: resourceData.titulo,
        instrucciones: 'Lee el siguiente texto y responde las preguntas',
        texto: 'La fotosíntesis es un proceso fundamental...',
        preguntas: [
          {
            pregunta: '¿Qué es la fotosíntesis?',
            opciones: ['A) Un proceso...', 'B) Una reacción...', 'C) Un fenómeno...'],
            respuestaCorrecta: 0
          }
        ]
      };

      // Act
      const result = await simulateCreateResource(userId, resourceData, generatedContent);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Recurso generado y guardado correctamente');
      expect(result.data.recurso).toBeDefined();
      expect(result.data.recurso.tipo).toBe(resourceData.tipo);
      expect(result.data.recurso.titulo).toBe(resourceData.titulo);
      expect(result.data.recurso.usuarioId).toBe(userId);
      expect(result.data.recurso.contenido).toEqual(generatedContent);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería fallar con datos inválidos', async () => {
      // Arrange
      const userId = 1;
      const invalidResourceData = {
        tipo: 'invalid_type', // Tipo no válido
        titulo: '', // Título vacío
        opciones: null
      };

      // Act
      const result = await simulateCreateResource(userId, invalidResourceData, null);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Datos de entrada inválidos');
      expect(result.data).toBeNull();
      expect(validateApiResponse(result, false)).toBe(true);
    });
  });

  describe('test_get_all_resources', () => {
    it('debería obtener todos los recursos del usuario', async () => {
      // Arrange
      const userId = 1;
      const mockResources = [
        generateRandomResource(userId),
        generateRandomResource(userId),
        generateRandomResource(userId)
      ];

      // Act
      const result = await simulateGetAllResources(userId, mockResources);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.recursos).toHaveLength(3);
      expect(result.data.count).toBe(3);
      expect(result.data.recursos[0].usuarioId).toBe(userId);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería retornar lista vacía si no hay recursos', async () => {
      // Arrange
      const userId = 1;
      const emptyResources = [];

      // Act
      const result = await simulateGetAllResources(userId, emptyResources);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.recursos).toHaveLength(0);
      expect(result.data.count).toBe(0);
      expect(validateApiResponse(result, true)).toBe(true);
    });
  });

  describe('test_get_resource_by_id', () => {
    it('debería obtener un recurso específico por ID', async () => {
      // Arrange
      const userId = 1;
      const resourceId = 123;
      const mockResource = {
        id: resourceId,
        ...generateRandomResource(userId)
      };

      // Act
      const result = await simulateGetResourceById(userId, resourceId, mockResource);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.recurso.id).toBe(resourceId);
      expect(result.data.recurso.usuarioId).toBe(userId);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería fallar si el recurso no existe', async () => {
      // Arrange
      const userId = 1;
      const nonexistentResourceId = 999;

      // Act
      const result = await simulateGetResourceById(userId, nonexistentResourceId, null);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Recurso no encontrado');
      expect(result.data).toBeNull();
      expect(validateApiResponse(result, false)).toBe(true);
    });

    it('debería fallar si el recurso no pertenece al usuario', async () => {
      // Arrange
      const userId = 1;
      const otherUserId = 2;
      const resourceId = 123;
      const otherUserResource = {
        id: resourceId,
        ...generateRandomResource(otherUserId)
      };

      // Act
      const result = await simulateGetResourceById(userId, resourceId, otherUserResource);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Recurso no encontrado');
      expect(validateApiResponse(result, false)).toBe(true);
    });
  });

  describe('test_update_resource', () => {
    it('debería actualizar un recurso exitosamente', async () => {
      // Arrange
      const userId = 1;
      const resourceId = 123;
      const existingResource = {
        id: resourceId,
        ...generateRandomResource(userId)
      };
      
      const updateData = {
        titulo: 'Título Actualizado',
        contenido: {
          ...existingResource.contenido,
          modificado: true
        }
      };

      // Act
      const result = await simulateUpdateResource(userId, resourceId, existingResource, updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Recurso actualizado correctamente');
      expect(result.data.recurso.titulo).toBe(updateData.titulo);
      expect(result.data.recurso.contenido.modificado).toBe(true);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería fallar si el recurso no existe', async () => {
      // Arrange
      const userId = 1;
      const nonexistentResourceId = 999;
      const updateData = {
        titulo: 'Nuevo Título'
      };

      // Act
      const result = await simulateUpdateResource(userId, nonexistentResourceId, null, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Recurso no encontrado');
      expect(validateApiResponse(result, false)).toBe(true);
    });
  });

  describe('test_delete_resource', () => {
    it('debería eliminar un recurso exitosamente', async () => {
      // Arrange
      const userId = 1;
      const resourceId = 123;
      const existingResource = {
        id: resourceId,
        ...generateRandomResource(userId)
      };

      // Act
      const result = await simulateDeleteResource(userId, resourceId, existingResource);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Recurso eliminado correctamente');
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería fallar si el recurso no existe', async () => {
      // Arrange
      const userId = 1;
      const nonexistentResourceId = 999;

      // Act
      const result = await simulateDeleteResource(userId, nonexistentResourceId, null);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Recurso no encontrado');
      expect(validateApiResponse(result, false)).toBe(true);
    });
  });

  describe('test_filter_resources_by_type', () => {
    it('debería filtrar recursos por tipo específico', async () => {
      // Arrange
      const userId = 1;
      const tipoFiltro = 'comprension';
      const allResources = [
        { ...generateRandomResource(userId), tipo: 'comprension' },
        { ...generateRandomResource(userId), tipo: 'escritura' },
        { ...generateRandomResource(userId), tipo: 'comprension' },
        { ...generateRandomResource(userId), tipo: 'gramatica' }
      ];

      // Act
      const result = await simulateFilterResourcesByType(userId, tipoFiltro, allResources);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.recursos).toHaveLength(2);
      expect(result.data.recursos.every(r => r.tipo === tipoFiltro)).toBe(true);
      expect(validateApiResponse(result, true)).toBe(true);
    });
  });

  describe('test_search_resources', () => {
    it('debería buscar recursos por título', async () => {
      // Arrange
      const userId = 1;
      const searchTerm = 'matemáticas';
      const allResources = [
        { ...generateRandomResource(userId), titulo: 'Recurso de Matemáticas Básicas' },
        { ...generateRandomResource(userId), titulo: 'Historia de América' },
        { ...generateRandomResource(userId), titulo: 'Matemáticas Avanzadas' },
        { ...generateRandomResource(userId), titulo: 'Ciencias Naturales' }
      ];

      // Act
      const result = await simulateSearchResources(userId, searchTerm, allResources);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.recursos).toHaveLength(2);
      expect(result.data.recursos.every(r => 
        r.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      )).toBe(true);
      expect(validateApiResponse(result, true)).toBe(true);
    });

    it('debería retornar resultados vacíos si no hay coincidencias', async () => {
      // Arrange
      const userId = 1;
      const searchTerm = 'inexistente';
      const allResources = [
        { ...generateRandomResource(userId), titulo: 'Recurso de Matemáticas' },
        { ...generateRandomResource(userId), titulo: 'Historia de América' }
      ];

      // Act
      const result = await simulateSearchResources(userId, searchTerm, allResources);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.recursos).toHaveLength(0);
      expect(validateApiResponse(result, true)).toBe(true);
    });
  });

});

// =====================================
// FUNCIONES AUXILIARES DE SIMULACIÓN
// =====================================

/**
 * Simula la creación de un recurso
 */
const simulateCreateResource = async (userId, resourceData, generatedContent) => {
  try {
    // Validar datos de entrada
    const validTypes = ['comprension', 'escritura', 'gramatica', 'oral', 'drag_and_drop', 'ice_breakers'];
    
    if (!resourceData.tipo || !validTypes.includes(resourceData.tipo)) {
      return mockApiError('Datos de entrada inválidos: tipo no válido', 400);
    }
    
    if (!resourceData.titulo || resourceData.titulo.trim() === '') {
      return mockApiError('Datos de entrada inválidos: título requerido', 400);
    }

    // Simular generación de contenido LLM
    await delay(100); // Simular tiempo de procesamiento
    
    const finalContent = generatedContent || {
      titulo: resourceData.titulo,
      contenido: 'Contenido generado automáticamente'
    };

    // Simular creación en base de datos
    const newResource = {
      id: Math.floor(Math.random() * 1000),
      usuarioId: userId,
      tipo: resourceData.tipo,
      titulo: resourceData.titulo,
      contenido: finalContent,
      meta: { opciones: resourceData.opciones || {} },
      tiempoGeneracionSegundos: 0.5,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return mockApiSuccess({
      recurso: newResource
    }, 'Recurso generado y guardado correctamente');

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};

/**
 * Simula obtener todos los recursos del usuario
 */
const simulateGetAllResources = async (userId, mockResources) => {
  try {
    // Filtrar recursos por usuario
    const userResources = mockResources.filter(r => r.usuarioId === userId);
    
    // Ordenar por fecha de creación (más recientes primero)
    userResources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return mockApiSuccess({
      recursos: userResources,
      count: userResources.length
    });

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};

/**
 * Simula obtener un recurso por ID
 */
const simulateGetResourceById = async (userId, resourceId, mockResource) => {
  try {
    // Verificar si el recurso existe y pertenece al usuario
    if (!mockResource || mockResource.usuarioId !== userId) {
      return mockApiError('Recurso no encontrado', 404);
    }

    return mockApiSuccess({
      recurso: mockResource
    });

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};

/**
 * Simula actualizar un recurso
 */
const simulateUpdateResource = async (userId, resourceId, existingResource, updateData) => {
  try {
    // Verificar si el recurso existe y pertenece al usuario
    if (!existingResource || existingResource.usuarioId !== userId) {
      return mockApiError('Recurso no encontrado', 404);
    }

    // Simular actualización
    const updatedResource = {
      ...existingResource,
      titulo: updateData.titulo || existingResource.titulo,
      contenido: updateData.contenido || existingResource.contenido,
      updatedAt: new Date()
    };

    return mockApiSuccess({
      recurso: updatedResource
    }, 'Recurso actualizado correctamente');

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};

/**
 * Simula eliminar un recurso
 */
const simulateDeleteResource = async (userId, resourceId, existingResource) => {
  try {
    // Verificar si el recurso existe y pertenece al usuario
    if (!existingResource || existingResource.usuarioId !== userId) {
      return mockApiError('Recurso no encontrado', 404);
    }

    // Simular eliminación (en realidad no eliminamos nada en el mock)
    return mockApiSuccess({}, 'Recurso eliminado correctamente');

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};

/**
 * Simula filtrar recursos por tipo
 */
const simulateFilterResourcesByType = async (userId, tipo, allResources) => {
  try {
    const filteredResources = allResources.filter(r => 
      r.usuarioId === userId && r.tipo === tipo
    );

    return mockApiSuccess({
      recursos: filteredResources,
      count: filteredResources.length
    });

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};

/**
 * Simula búsqueda de recursos
 */
const simulateSearchResources = async (userId, searchTerm, allResources) => {
  try {
    const searchResults = allResources.filter(r => 
      r.usuarioId === userId && 
      r.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return mockApiSuccess({
      recursos: searchResults,
      count: searchResults.length
    });

  } catch (error) {
    return mockApiError('Error interno del servidor', 500);
  }
};
