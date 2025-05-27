import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import { generarRecurso } from '../services/llm.service.js';

// Controller to create a new exam using LLM service
export const createExam = async (req, res, next) => {
  try {
    const { titulo, tipoTexto, tema, longitud, numLiteral } = req.body;
    const opciones = { titulo, tipoTexto, tema, longitud, numLiteral };
    const result = await generarRecurso({ tipo: 'evaluacion', opciones });
    const slug = uuidv4().substr(0, 8);
    const exam = await Exam.create({ slug, titulo: result.titulo, texto: result.texto, preguntas: result.preguntas });
    res.json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

// Controller to list all exams
export const listExams = async (req, res, next) => {
  try {
    const exams = await Exam.findAll();
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
    const { studentName, respuestas } = req.body;
    const exam = await Exam.findOne({ where: { slug } });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    const preguntas = exam.preguntas;
    let correct = 0;
    const start = Date.now();
    respuestas.forEach((resp) => {
      const idx = resp.preguntaIndex;
      if (preguntas[idx] && preguntas[idx].respuesta === resp.respuestaSeleccionada) {
        correct++;
      }
    });
    const score = Math.round((correct / preguntas.length) * 20);
    const evalTime = (Date.now() - start) / 1000;
    // Si la calificación es 0, simular animación de carga
    if (score === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await ExamResult.create({ studentName, respuestas, score, examSlug: slug, evalTime });
    res.json({ success: true, data: { score, total: preguntas.length } });
  } catch (err) {
    next(err);
  }
};

// Controller to get all results for an exam
export const getExamResults = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const results = await ExamResult.findAll({ where: { examSlug: slug }, attributes: ['studentName', 'score'], order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};
