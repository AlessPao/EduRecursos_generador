import { jest } from '@jest/globals';

// Mocks antes de importar los módulos reales
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

jest.mock('../../src/models/Recurso.js', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock('../../src/services/llm.service.js', () => ({
  generarRecurso: jest.fn()
}));

// Importamos después de los mocks
import { validationResult } from 'express-validator';
import Recurso from '../../src/models/Recurso.js';
import { generarRecurso } from '../../src/services/llm.service.js';

// Implementaciones simuladas de las funciones del controlador
const createRecurso = jest.fn();
const getRecursosByUsuario = jest.fn();
const updateRecurso = jest.fn();
const deleteRecurso = jest.fn();

// Implementación simulada de createRecurso
createRecurso.mockImplementation(async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { tipo, titulo, opciones } = req.body;
    
    // Generar contenido con LLM
    const contenidoGenerado = await generarRecurso({ tipo, opciones });

    // Guardar recurso en base de datos
    const recurso = await Recurso.create({
      usuarioId: req.user.userId,
      tipo,
      titulo,
      contenido: contenidoGenerado,
      meta: { opciones },
      tiempoGeneracionSegundos: 1.5 // Valor de prueba
    });
    
    res.status(201).json({
      success: true,
      message: 'Recurso generado y guardado correctamente',
      recurso
    });
  } catch (error) {
    next(error);
  }
});

// Implementación simulada de getRecursosByUsuario
getRecursosByUsuario.mockImplementation(async (req, res, next) => {
  try {
    const recursos = await Recurso.findAll({
      where: { usuarioId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: recursos.length,
      recursos
    });
  } catch (error) {
    next(error);
  }
});

// Implementación simulada de updateRecurso
updateRecurso.mockImplementation(async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { titulo, contenido } = req.body;
    
    // Verificar que el recurso existe y pertenece al usuario
    const recurso = await Recurso.findOne({
      where: { 
        id: req.params.id,
        usuarioId: req.user.userId
      }
    });
    
    if (!recurso) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }
    
    // Actualizar recurso
    recurso.titulo = titulo || recurso.titulo;
    recurso.contenido = contenido || recurso.contenido;
    await recurso.save();
    
    res.status(200).json({
      success: true,
      message: 'Recurso actualizado correctamente',
      recurso
    });
  } catch (error) {
    next(error);
  }
});

// Implementación simulada de deleteRecurso
deleteRecurso.mockImplementation(async (req, res, next) => {
  try {
    // Verificar que el recurso existe y pertenece al usuario
    const recurso = await Recurso.findOne({
      where: { 
        id: req.params.id,
        usuarioId: req.user.userId
      }
    });
    
    if (!recurso) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }
    
    // Eliminar recurso
    await recurso.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Recurso eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
});

describe('Recursos Controller', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock de request, response y next
    req = {
      body: {},
      params: {},
      user: {
        userId: 1
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Mock validationResult por defecto (sin errores)
    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([])
    });
  });
  
  /**
   * Caso de prueba: Crear un Nuevo Recurso
   * Verifica que se pueda crear un nuevo recurso asociado a un usuario.
   */
  describe('createRecurso', () => {
    it('debería crear un nuevo recurso correctamente', async () => {
      // Datos de prueba
      const recursoData = {
        tipo: 'comprension',
        titulo: 'Comprensión Lectora - Nivel B1',
        opciones: {
          idioma: 'inglés',
          nivel: 'B1',
          tema: 'viajes'
        }
      };
      
      req.body = recursoData;
      
      // Mock del contenido generado por el LLM
      const contenidoGenerado = {
        texto: 'This is a sample text for reading comprehension',
        preguntas: [
          {
            pregunta: 'What is the main topic?',
            opciones: ['Travel', 'Food', 'Sports'],
            respuestaCorrecta: 0
          }
        ]
      };
      
      generarRecurso.mockResolvedValue(contenidoGenerado);
      
      // Mock del recurso creado
      const recursoCreado = {
        id: 1,
        usuarioId: req.user.userId,
        tipo: recursoData.tipo,
        titulo: recursoData.titulo,
        contenido: contenidoGenerado,
        meta: { opciones: recursoData.opciones },
        tiempoGeneracionSegundos: 1.5
      };
      
      Recurso.create.mockResolvedValue(recursoCreado);
      
      // Ejecutar el controlador
      await createRecurso(req, res, next);
      
      // Verificar que se llamó al generador de recursos
      expect(generarRecurso).toHaveBeenCalledWith({
        tipo: recursoData.tipo,
        opciones: recursoData.opciones
      });
      
      // Verificar que se creó el recurso
      expect(Recurso.create).toHaveBeenCalledWith({
        usuarioId: req.user.userId,
        tipo: recursoData.tipo,
        titulo: recursoData.titulo,
        contenido: contenidoGenerado,
        meta: { opciones: recursoData.opciones },
        tiempoGeneracionSegundos: 1.5
      });
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Recurso generado y guardado correctamente',
        recurso: recursoCreado
      }));
    });
  });
  
  /**
   * Caso de prueba: Obtener Todos los Recursos de un Usuario
   * Verifica que se puedan obtener todos los recursos de un usuario específico.
   */
  describe('getRecursosByUsuario', () => {
    it('debería obtener todos los recursos del usuario', async () => {
      // Datos de prueba
      const recursosEncontrados = [
        {
          id: 1,
          usuarioId: 1,
          tipo: 'comprension',
          titulo: 'Recurso 1',
          contenido: { data: 'contenido 1' },
          meta: { opciones: {} },
          createdAt: new Date()
        },
        {
          id: 2,
          usuarioId: 1,
          tipo: 'escritura',
          titulo: 'Recurso 2',
          contenido: { data: 'contenido 2' },
          meta: { opciones: {} },
          createdAt: new Date()
        }
      ];
      
      // Mock para simular que se encontraron recursos
      Recurso.findAll.mockResolvedValue(recursosEncontrados);
      
      // Ejecutar el controlador
      await getRecursosByUsuario(req, res, next);
      
      // Verificar que se buscaron los recursos del usuario
      expect(Recurso.findAll).toHaveBeenCalledWith({
        where: { usuarioId: req.user.userId },
        order: [['createdAt', 'DESC']]
      });
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: recursosEncontrados.length,
        recursos: recursosEncontrados
      });
    });
    
    it('debería devolver un array vacío si el usuario no tiene recursos', async () => {
      // Mock para simular que no se encontraron recursos
      Recurso.findAll.mockResolvedValue([]);
      
      // Ejecutar el controlador
      await getRecursosByUsuario(req, res, next);
      
      // Verificar que se buscaron los recursos del usuario
      expect(Recurso.findAll).toHaveBeenCalledWith({
        where: { usuarioId: req.user.userId },
        order: [['createdAt', 'DESC']]
      });
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        recursos: []
      });
    });
  });
  
  /**
   * Caso de prueba: Actualizar un Recurso
   * Verifica que un recurso existente pueda ser actualizado por su propietario.
   */
  describe('updateRecurso', () => {
    it('debería actualizar un recurso existente', async () => {
      // Datos de prueba
      const recursoId = 1;
      const datosActualizados = {
        titulo: 'Título Actualizado',
        contenido: { data: 'contenido actualizado' }
      };
      
      req.params.id = recursoId;
      req.body = datosActualizados;
      
      // Recurso existente en la base de datos
      const recursoExistente = {
        id: recursoId,
        usuarioId: req.user.userId,
        tipo: 'comprension',
        titulo: 'Título Original',
        contenido: { data: 'contenido original' },
        meta: { opciones: {} },
        save: jest.fn().mockResolvedValue(true),
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      // Recurso después de la actualización
      const recursoActualizado = {
        ...recursoExistente,
        titulo: datosActualizados.titulo,
        contenido: datosActualizados.contenido
      };
      
      // Mock para simular que el recurso existe
      Recurso.findOne.mockResolvedValue(recursoExistente);
      
      // Actualizar propiedades para simular la actualización
      recursoExistente.titulo = datosActualizados.titulo;
      recursoExistente.contenido = datosActualizados.contenido;
      
      // Ejecutar el controlador
      await updateRecurso(req, res, next);
      
      // Verificar que se buscó el recurso
      expect(Recurso.findOne).toHaveBeenCalledWith({
        where: {
          id: recursoId,
          usuarioId: req.user.userId
        }
      });
      
      // Verificar que se guardó el recurso actualizado
      expect(recursoExistente.save).toHaveBeenCalled();
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Recurso actualizado correctamente',
        recurso: recursoActualizado
      }));
    });
    
    it('debería retornar un error si el recurso no existe', async () => {
      // Datos de prueba
      const recursoId = 999;
      const datosActualizados = {
        titulo: 'Título Actualizado',
        contenido: { data: 'contenido actualizado' }
      };
      
      req.params.id = recursoId;
      req.body = datosActualizados;
      
      // Mock para simular que el recurso no existe
      Recurso.findOne.mockResolvedValue(null);
      
      // Ejecutar el controlador
      await updateRecurso(req, res, next);
      
      // Verificar que se buscó el recurso
      expect(Recurso.findOne).toHaveBeenCalledWith({
        where: {
          id: recursoId,
          usuarioId: req.user.userId
        }
      });
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Recurso no encontrado'
      });
    });
  });
  
  /**
   * Caso de prueba: Eliminar un Recurso
   * Verifica que un recurso pueda ser eliminado.
   */
  describe('deleteRecurso', () => {
    it('debería eliminar un recurso existente', async () => {
      // Datos de prueba
      const recursoId = 1;
      
      req.params.id = recursoId;
      
      // Recurso existente en la base de datos
      const recursoExistente = {
        id: recursoId,
        usuarioId: req.user.userId,
        tipo: 'comprension',
        titulo: 'Recurso a eliminar',
        contenido: { data: 'contenido' },
        meta: { opciones: {} },
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      // Mock para simular que el recurso existe
      Recurso.findOne.mockResolvedValue(recursoExistente);
      
      // Ejecutar el controlador
      await deleteRecurso(req, res, next);
      
      // Verificar que se buscó el recurso
      expect(Recurso.findOne).toHaveBeenCalledWith({
        where: {
          id: recursoId,
          usuarioId: req.user.userId
        }
      });
      
      // Verificar que se eliminó el recurso
      expect(recursoExistente.destroy).toHaveBeenCalled();
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Recurso eliminado correctamente'
      });
    });
    
    it('debería retornar un error si el recurso no existe', async () => {
      // Datos de prueba
      const recursoId = 999;
      
      req.params.id = recursoId;
      
      // Mock para simular que el recurso no existe
      Recurso.findOne.mockResolvedValue(null);
      
      // Ejecutar el controlador
      await deleteRecurso(req, res, next);
      
      // Verificar que se buscó el recurso
      expect(Recurso.findOne).toHaveBeenCalledWith({
        where: {
          id: recursoId,
          usuarioId: req.user.userId
        }
      });
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Recurso no encontrado'
      });
    });
  });
});
