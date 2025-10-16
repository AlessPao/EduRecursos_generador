import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
import { validationResult } from 'express-validator';
import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import Usuario from '../models/Usuario.js';
import { generarRecurso } from '../services/llm.service.js';

// Controller to create a new exam using LLM service
export const createExam = async (req, res, next) => {
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
    
    // Registrar hora de inicio
    const horaInicio = new Date();
    
    // Generar recurso con LLM
    const start = Date.now();
    const result = await generarRecurso({ tipo: 'evaluacion', opciones });
    const end = Date.now();
    const tiempoGeneracionSegundos = (end - start) / 1000;
    
    // Registrar hora de fin
    const horaFin = new Date();
    
    const slug = uuidv4().substr(0, 8);
    const exam = await Exam.create({ 
      usuarioId: req.user.userId,
      slug, 
      titulo: result.titulo, 
      texto: result.texto, 
      preguntas: result.preguntas,
      tiempoGeneracionSegundos,
      horaInicio,
      horaFin
    });
    res.json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

// Controller to list all exams (only user's exams)
export const listExams = async (req, res, next) => {
  try {
    const exams = await Exam.findAll({ 
      where: { usuarioId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: exams });
  } catch (err) {
    next(err);
  }
};

// Controller to get a single exam by slug
export const getExam = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const exam = await Exam.findOne({ where: { slug } });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

// Controller to submit exam answers and calculate score
export const submitExam = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { studentName, respuestas, evalTime, horaInicio, horaFin } = req.body;
    
    const exam = await Exam.findOne({ where: { slug } });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    
    const preguntas = exam.preguntas;
    let correct = 0;
    
    respuestas.forEach((resp) => {
      const idx = resp.preguntaIndex;
      if (preguntas[idx] && preguntas[idx].respuesta === resp.respuestaSeleccionada) {
        correct++;
      }
    });
    
    const score = Math.round((correct / preguntas.length) * 20);
    
    // Usar el tiempo enviado desde el frontend, o 0 si no se proporciona
    const finalEvalTime = evalTime || 0;
    
    // Si la calificación es 0, simular animación de carga
    if (score === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    await ExamResult.create({ 
      examId: exam.id,
      usuarioId: exam.usuarioId,
      studentName, 
      respuestas, 
      score, 
      examSlug: slug, 
      evalTime: finalEvalTime,
      horaInicio: horaInicio ? new Date(horaInicio) : null,
      horaFin: horaFin ? new Date(horaFin) : new Date()
    });
    
    res.json({ success: true, data: { score, total: preguntas.length } });
  } catch (err) {
    next(err);
  }
};

// Controller to get all results for an exam (only if user owns the exam)
export const getExamResults = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // Verificar que el examen pertenece al usuario autenticado
    const exam = await Exam.findOne({ 
      where: { slug, usuarioId: req.user.userId } 
    });
    
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Examen no encontrado o no tienes permisos para verlo' 
      });
    }
    
    const results = await ExamResult.findAll({ 
      where: { examId: exam.id }, 
      attributes: ['id', 'usuarioId', 'studentName', 'score', 'evalTime', 'horaInicio', 'horaFin', 'createdAt', 'examSlug'],
      include: [{
        model: Exam,
        as: 'exam',
        attributes: ['id', 'titulo', 'slug']
      }, {
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'email']
      }],
      order: [['createdAt', 'DESC']] 
    });
    
    res.json({ success: true, data: results });  } catch (err) {
    next(err);
  }
};

// Controller to delete all results for an exam (only if user owns the exam)
export const deleteExamResults = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // Verificar que el examen pertenece al usuario autenticado
    const exam = await Exam.findOne({ 
      where: { slug, usuarioId: req.user.userId } 
    });
    
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Examen no encontrado o no tienes permisos para modificarlo' 
      });
    }
    
    // Eliminar todos los resultados del examen
    const deletedCount = await ExamResult.destroy({ 
      where: { examId: exam.id } 
    });
    
    res.json({ 
      success: true, 
      message: `${deletedCount} resultados eliminados correctamente`,
      deletedCount 
    });
  } catch (err) {
    next(err);
  }
};

// Controller to delete an exam (only if user owns the exam)
export const deleteExam = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // Verificar que el examen pertenece al usuario autenticado
    const exam = await Exam.findOne({ 
      where: { slug, usuarioId: req.user.userId } 
    });
    
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Examen no encontrado o no tienes permisos para eliminarlo' 
      });
    }
    
    // Eliminar todos los resultados del examen
    await ExamResult.destroy({ 
      where: { examId: exam.id } 
    });
    
    // Eliminar el examen
    await exam.destroy();
    
    res.json({ 
      success: true, 
      message: 'Examen eliminado correctamente' 
    });
  } catch (err) {
    next(err);
  }
};
