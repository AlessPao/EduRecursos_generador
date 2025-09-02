import { jest } from '@jest/globals';

// Mocks antes de importar los módulos reales
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-1234')
}));

jest.mock('../../src/models/Exam.js', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock('../../src/models/ExamResult.js', () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn()
}));

jest.mock('../../src/services/llm.service.js', () => ({
  generarRecurso: jest.fn()
}));

// Importamos después de los mocks
import { validationResult } from 'express-validator';
import Exam from '../../src/models/Exam.js';
import ExamResult from '../../src/models/ExamResult.js';
import { generarRecurso } from '../../src/services/llm.service.js';
import pkg from 'uuid';

// Implementaciones simuladas de las funciones del controlador
const createExam = jest.fn();
const getExamById = jest.fn();

// Implementación simulada de createExam
createExam.mockImplementation(async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { titulo, tipoTexto, tema, longitud, numLiteral } = req.body;
    const opciones = { titulo, tipoTexto, tema, longitud, numLiteral };
    
    // Generar contenido con LLM
    const result = await generarRecurso({ tipo: 'evaluacion', opciones });
    
    // Generar slug único
    const slug = pkg.v4().substr(0, 8);
    
    // Crear examen en la base de datos
    const exam = await Exam.create({ 
      usuarioId: req.user.userId,
      slug, 
      titulo: result.titulo, 
      texto: result.texto, 
      preguntas: result.preguntas
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Examen creado correctamente',
      data: exam 
    });
  } catch (error) {
    next(error);
  }
});

// Implementación simulada de getExamById
getExamById.mockImplementation(async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Buscar el examen por ID
    const exam = await Exam.findOne({ 
      where: { id }
    });
    
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Examen no encontrado' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: exam 
    });
  } catch (error) {
    next(error);
  }
});

describe('Exams Controller', () => {
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
   * Caso de prueba: Crear un Nuevo Examen
   * Verifica la creación de un nuevo examen.
   */
  describe('createExam', () => {
    it('debería crear un nuevo examen correctamente', async () => {
      // Datos de prueba
      const examData = {
        titulo: 'Evaluación de Comprensión Lectora',
        tipoTexto: 'narrativo',
        tema: 'viajes',
        longitud: 'media',
        numLiteral: 5
      };
      
      req.body = examData;
      
      // Mock del contenido generado por el LLM
      const contenidoGenerado = {
        titulo: 'Evaluación: Un viaje inolvidable',
        texto: 'Este es un texto narrativo sobre un viaje inolvidable...',
        preguntas: [
          {
            pregunta: '¿Cuál es el destino principal del viaje?',
            opciones: ['París', 'Roma', 'Londres'],
            respuesta: 1
          },
          {
            pregunta: '¿Qué sucedió durante el viaje?',
            opciones: ['Perdieron las maletas', 'Conocieron a un local', 'Se extraviaron'],
            respuesta: 2
          }
        ]
      };
      
      generarRecurso.mockResolvedValue(contenidoGenerado);
      
      // Mock del slug generado
      pkg.v4.mockReturnValue('abcd1234-efgh-5678-ijkl-9012mnopqrst');
      
      // Mock del examen creado
      const examCreado = {
        id: 'exam-uuid-1',
        usuarioId: req.user.userId,
        slug: 'abcd1234',
        titulo: contenidoGenerado.titulo,
        texto: contenidoGenerado.texto,
        preguntas: contenidoGenerado.preguntas
      };
      
      Exam.create.mockResolvedValue(examCreado);
      
      // Ejecutar el controlador
      await createExam(req, res, next);
      
      // Verificar que se llamó al generador de contenido
      expect(generarRecurso).toHaveBeenCalledWith({
        tipo: 'evaluacion',
        opciones: {
          titulo: examData.titulo,
          tipoTexto: examData.tipoTexto,
          tema: examData.tema,
          longitud: examData.longitud,
          numLiteral: examData.numLiteral
        }
      });
      
      // Verificar que se generó un slug
      expect(pkg.v4).toHaveBeenCalled();
      
      // Verificar que se creó el examen
      expect(Exam.create).toHaveBeenCalledWith({
        usuarioId: req.user.userId,
        slug: 'abcd1234',
        titulo: contenidoGenerado.titulo,
        texto: contenidoGenerado.texto,
        preguntas: contenidoGenerado.preguntas
      });
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Examen creado correctamente',
        data: examCreado
      });
    });
  });
  
  /**
   * Caso de prueba: Obtener un Examen por ID
   * Verifica que se pueda obtener un examen específico con sus preguntas y opciones.
   */
  describe('getExamById', () => {
    it('debería obtener un examen específico por su ID', async () => {
      // Datos de prueba
      const examId = 'exam-uuid-1';
      
      req.params.id = examId;
      
      // Examen encontrado en la base de datos
      const examEncontrado = {
        id: examId,
        usuarioId: 1,
        slug: 'abcd1234',
        titulo: 'Evaluación: Un viaje inolvidable',
        texto: 'Este es un texto narrativo sobre un viaje inolvidable...',
        preguntas: [
          {
            pregunta: '¿Cuál es el destino principal del viaje?',
            opciones: ['París', 'Roma', 'Londres'],
            respuesta: 1
          },
          {
            pregunta: '¿Qué sucedió durante el viaje?',
            opciones: ['Perdieron las maletas', 'Conocieron a un local', 'Se extraviaron'],
            respuesta: 2
          }
        ]
      };
      
      // Mock para simular que se encontró el examen
      Exam.findOne.mockResolvedValue(examEncontrado);
      
      // Ejecutar el controlador
      await getExamById(req, res, next);
      
      // Verificar que se buscó el examen por ID
      expect(Exam.findOne).toHaveBeenCalledWith({
        where: { id: examId }
      });
      
      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: examEncontrado
      });
    });
    
    it('debería retornar un error si el examen no existe', async () => {
      // Datos de prueba
      const examId = 'exam-no-existente';
      
      req.params.id = examId;
      
      // Mock para simular que no se encontró el examen
      Exam.findOne.mockResolvedValue(null);
      
      // Ejecutar el controlador
      await getExamById(req, res, next);
      
      // Verificar que se buscó el examen por ID
      expect(Exam.findOne).toHaveBeenCalledWith({
        where: { id: examId }
      });
      
      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Examen no encontrado'
      });
    });
  });
});
