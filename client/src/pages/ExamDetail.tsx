import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import { Clipboard, Trash2, RefreshCw, ArrowLeft, CheckCircle, Clock, User } from 'lucide-react';

interface Question {
  pregunta: string;
  opciones: string[];
  respuesta: string;
}
interface Exam {
  titulo: string;
  texto: string;
  preguntas: Question[];
}
interface Result {
  studentName: string;
  score: number;
  evalTime: number;
}

const ExamDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRes, setLoadingRes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteResultsConfirm, setShowDeleteResultsConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingResults, setDeletingResults] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const formatTime = (seconds: number): string => {
    if (!seconds || seconds === 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchResults = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/exams/${slug}/results`);
      if (res.data.success) {
        setResults(res.data.data);
        toast.success('Resultados actualizados', { autoClose: 1500 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar resultados');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`${API_URL}/exams/${slug}`);
        if (res.data.success) setExam(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar examen');
      } finally {
        setLoading(false);
      }
    };
    const loadResults = async () => {
      try {
        const res = await axios.get(`${API_URL}/exams/${slug}/results`);
        if (res.data.success) setResults(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRes(false);
      }
    };
    fetchExam();
    loadResults();
  }, [slug]);

  const handleCopy = () => {
    const url = `${window.location.origin}/evaluaciones/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!slug) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_URL}/exams/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success('Examen eliminado correctamente');
        navigate('/evaluaciones');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el examen');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteResults = async () => {
    if (!slug) return;

    setDeletingResults(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_URL}/exams/${slug}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success('Resultados eliminados correctamente');
        setResults([]); // Limpiar la lista local
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar los resultados');
    } finally {
      setDeletingResults(false);
      setShowDeleteResultsConfirm(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!exam) return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-slate-900">Examen no encontrado</h2>
      <button onClick={() => navigate('/evaluaciones')} className="btn btn-primary mt-4">
        Volver a la lista
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/evaluaciones')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{exam.titulo}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Detalles y resultados de la evaluación</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Exam Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contenido del Examen</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  title="Eliminar examen"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Share Link Box */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-6">
              <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide mb-2">
                Enlace para estudiantes
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  className="flex-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-400 text-sm rounded-lg px-3 py-2 focus:outline-none"
                  value={`${window.location.origin}/evaluaciones/${slug}`}
                />
                <button
                  onClick={handleCopy}
                  className="btn btn-primary py-2 px-4 flex items-center gap-2"
                >
                  {copied ? <CheckCircle size={18} /> : <Clipboard size={18} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-8">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-serif">
                {exam.texto}
              </div>
            </div>

            <div className="space-y-6">
              {exam.preguntas.map((q, idx) => (
                <div key={idx} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-6 last:pb-0">
                  <p className="font-semibold text-slate-900 dark:text-white mb-3">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">{idx + 1}.</span>
                    {q.pregunta}
                  </p>
                  <ul className="space-y-2 pl-6">
                    {q.opciones.map((opt, i) => (
                      <li
                        key={i}
                        className={`text-sm ${
                          opt === q.respuesta
                            ? 'text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          opt === q.respuesta
                            ? 'bg-emerald-500 dark:bg-emerald-400'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}></span>
                        {opt}
                        {opt === q.respuesta && (
                          <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                            Correcta
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Results */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Resultados</h3>
              <div className="flex gap-2">
                <button
                  onClick={fetchResults}
                  disabled={refreshing}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="Actualizar resultados"
                >
                  <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                </button>
                {results.length > 0 && (
                  <button
                    onClick={() => setShowDeleteResultsConfirm(true)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    title="Limpiar resultados"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {loadingRes ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {results.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <User size={14} />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white text-sm">{r.studentName}</span>
                      </div>
                      <span className={`text-sm font-bold px-2 py-1 rounded-lg ${r.score >= 14 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          r.score >= 11 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                            'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        }`}>
                        {r.score}/20
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 pl-10">
                      <Clock size={12} />
                      {formatTime(r.evalTime)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 border-dashed">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Aún no hay resultados registrados.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar examen */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 dark:border-slate-700 transform transition-all">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">¿Eliminar examen?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Esta acción no se puede deshacer. Se eliminarán permanentemente el examen y todos los resultados asociados.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar resultados */}
      {showDeleteResultsConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 dark:border-slate-700 transform transition-all">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">¿Limpiar resultados?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Se eliminarán todos los intentos de los estudiantes. El examen seguirá disponible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteResultsConfirm(false)}
                className="btn btn-ghost"
                disabled={deletingResults}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteResults}
                className="btn btn-danger"
                disabled={deletingResults}
              >
                {deletingResults ? 'Eliminando...' : 'Sí, limpiar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetail;
