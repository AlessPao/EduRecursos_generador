import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Clock, CheckCircle, User, ArrowRight, Award, BookOpen } from 'lucide-react';

interface Question {
  pregunta: string;
  opciones: string[];
  respuesta: string; // respuesta correcta, pero no se muestra
}

interface Exam {
  titulo: string;
  texto: string;
  preguntas: Question[];
}

const ExamPublic: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/exams/${slug}`);
        if (res.data.success) {
          setExam(res.data.data);
        } else {
          toast.error('Examen no encontrado');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar el examen');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [slug]);

  // Timer para medir el tiempo transcurrido
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (started && score === null && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [started, score, startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!studentName.trim()) {
      toast.warn('Ingresa tu nombre para comenzar');
      return;
    }
    const now = Date.now();
    setStartTime(now);
    setStarted(true);
    setElapsedTime(0);
  };

  const handleSelect = (index: number, option: string) => {
    setAnswers(prev => ({ ...prev, [index]: option }));
  };

  const handleSubmit = async () => {
    if (!exam) return;
    if (Object.keys(answers).length !== exam.preguntas.length) {
      toast.warn('Responde todas las preguntas');
      return;
    }

    const endTime = Date.now();
    const totalTime = startTime ? Math.floor((endTime - startTime) / 1000) : 0;

    try {
      setSubmitting(true);
      const payload = {
        studentName,
        evalTime: totalTime,
        horaInicio: startTime ? new Date(startTime).toISOString() : null,
        horaFin: new Date(endTime).toISOString(),
        respuestas: Object.entries(answers).map(([idx, respuestaSeleccionada]) => ({
          preguntaIndex: parseInt(idx, 10),
          respuestaSeleccionada
        }))
      };
      const res = await axios.post(`${API_URL}/exams/${slug}/submit`, payload);
      if (res.data.success) {
        setScore(res.data.data.score);
        triggerConfetti();
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar respuestas');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Examen no encontrado</h2>
          <p className="text-slate-500">Lo sentimos, no pudimos encontrar la evaluación que buscas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!started && score === null ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
            >
              <div className="bg-indigo-600 p-8 text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{exam.titulo}</h1>
                <p className="text-indigo-100">Evaluación de Comprensión Lectora</p>
              </div>

              <div className="p-8">
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <p className="text-slate-600 mb-2">¡Hola! 👋</p>
                    <p className="text-slate-900 font-medium text-lg">
                      Ingresa tu nombre completo para comenzar
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="form-input pl-10 text-lg py-3"
                      placeholder="Tu nombre aquí..."
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleStart}
                    className="btn btn-primary w-full py-4 text-lg shadow-lg shadow-indigo-200 group"
                  >
                    Comenzar Examen
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : started && score === null ? (
            <motion.div
              key="exam"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header Sticky */}
              <div className="sticky top-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                    {studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estudiante</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{studentName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{formatTime(elapsedTime)}</span>
                </div>
              </div>

              {/* Reading Text */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Lectura
                </h2>
                <div className="prose prose-slate max-w-none prose-lg leading-relaxed bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 font-serif text-slate-700 dark:text-slate-200">
                  {exam.texto}
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {exam.preguntas.map((q, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8"
                  >
                    <div className="flex gap-4 mb-6">
                      <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-lg flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </span>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white pt-1">{q.pregunta}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pl-12">
                      {q.opciones.map((opt) => (
                        <label
                          key={opt}
                          className={`relative flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 group ${
                            answers[idx] === opt
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm'
                              : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${idx}`}
                            value={opt}
                            checked={answers[idx] === opt}
                            onChange={() => handleSelect(idx, opt)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                            answers[idx] === opt
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500'
                              : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400 dark:group-hover:border-indigo-500'
                          }`}>
                            {answers[idx] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span className={`text-base ${
                            answers[idx] === opt
                              ? 'text-indigo-900 dark:text-indigo-100 font-medium'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="sticky bottom-4 z-10">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-200 text-lg transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:transform-none"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      Enviando respuestas...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-6 w-6" />
                      Finalizar Examen
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden text-center max-w-lg mx-auto border border-slate-100"
            >
              <div className="bg-emerald-500 p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-600 opacity-20 pattern-dots"></div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10"
                >
                  <Award className="h-12 w-12 text-emerald-500" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white relative z-10">¡Excelente trabajo!</h2>
                <p className="text-emerald-100 mt-2 relative z-10">{studentName}</p>
              </div>

              <div className="p-8">
                <p className="text-slate-500 font-medium uppercase tracking-wide text-sm mb-2">Tu Calificación Final</p>
                <div className="text-6xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {score}<span className="text-3xl text-slate-400 font-normal">/20</span>
                </div>

                <div className="flex justify-center gap-2 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < Math.round((score! / 20) * 5)} />
                  ))}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Tiempo total:</span>
                    <span className="font-bold text-slate-900">{formatTime(elapsedTime)}</span>
                  </div>
                </div>

                <p className="text-slate-500 text-sm">
                  Gracias por completar la evaluación. Puedes cerrar esta ventana.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`w-8 h-8 ${filled ? 'text-amber-400' : 'text-slate-200'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default ExamPublic;
