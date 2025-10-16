import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

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
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar respuestas');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!exam) {
    return <p className="p-6">Examen no disponible.</p>;
  }

  return (
    <div className="pt-20 p-4 min-h-screen bg-gradient-to-br from-blue-50 to-white flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-blue-100">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center drop-shadow">{exam.titulo}</h1>
          <div className="h-1 w-16 bg-blue-200 rounded mx-auto mb-6" />

          {!started && score === null && (
            <div className="space-y-6 flex flex-col items-center">
              <p className="text-gray-700 text-lg">Ingresa tu nombre para comenzar el examen:</p>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="form-input w-full max-w-xs border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Tu nombre"
              />
              <button
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center"
              >
                <span className="material-icons mr-2"></span>Comenzar
              </button>
            </div>
          )}          {started && score === null && (
            <div className="space-y-8">
              {/* Timer visible */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-yellow-800 font-semibold">⏱️ Tiempo transcurrido:</span>
                  <span className="text-yellow-900 font-bold text-lg">{formatTime(elapsedTime)}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <p className="text-gray-800 text-base whitespace-pre-line">{exam.texto}</p>
              </div>
              {exam.preguntas.map((q, idx) => (
                <div key={idx} className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                  <p className="font-semibold text-lg mb-3 text-blue-800">{idx + 1}. {q.pregunta}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.opciones.map((opt) => (
                      <label key={opt} className={`flex items-center px-3 py-2 rounded-lg cursor-pointer border transition-all ${answers[idx] === opt ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={opt}
                          checked={answers[idx] === opt}
                          onChange={() => handleSelect(idx, opt)}
                          className="accent-blue-600 mr-2"
                        />
                        <span className="text-gray-800">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg text-lg transition mt-4"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-6 w-6 mr-2 border-4 border-white border-t-transparent rounded-full"></span>
                    Enviando...
                  </span>
                ) : (
                  'Enviar respuestas'
                )}
              </button>
            </div>
          )}

          {score !== null && (
            <div className="text-center mt-12">
              <div className="inline-block bg-green-100 border border-green-300 rounded-full px-8 py-6 shadow-lg">
                <p className="text-2xl font-bold text-green-700 mb-2">¡Examen finalizado!</p>
                <p className="text-lg text-gray-700">Has obtenido</p>
                <p className="text-4xl font-extrabold text-green-800 my-2 drop-shadow">{score} / 20</p>
                <p className="text-gray-500 mt-2">Gracias por participar.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPublic;
