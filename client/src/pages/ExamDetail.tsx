import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import { Clipboard, Trash2 } from 'lucide-react';

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
  const [deleting, setDeleting] = useState(false);

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
    const fetchResults = async () => {
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
    fetchResults();
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

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
  if (!exam) return <p className="p-6">Examen no encontrado.</p>;

  return (
    <div className="pt-20 p-4 min-h-screen bg-gradient-to-br from-blue-50 to-white flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-2xl font-extrabold text-blue-700 mb-2 text-center drop-shadow">{exam.titulo}</h2>
          <div className="h-1 w-16 bg-blue-200 rounded mx-auto mb-6" />
          <textarea readOnly className="w-full p-3 border rounded-lg h-32 mb-6 bg-blue-50 text-gray-700 font-mono" value={exam.texto} />          <div className="flex flex-col sm:flex-row items-center mb-6 gap-2">
            <input
              readOnly
              className="flex-1 form-input border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-blue-50"
              value={`${window.location.origin}/evaluaciones/${slug}`}
            />
            <div className="flex gap-2">
              <button onClick={handleCopy} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center transition">
                <Clipboard size={16} className="mr-1" />
                {copied ? 'Copiado' : 'Copiar enlace'}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center transition"
                title="Eliminar examen"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6 text-center">Comparte este enlace con tus estudiantes.</p>
          <div className="space-y-4">
            {exam.preguntas.map((q, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                <p className="font-semibold text-lg mb-2 text-blue-800">{idx + 1}. {q.pregunta}</p>
                <ul className="list-disc list-inside space-y-1">
                  {q.opciones.map((opt, i) => (
                    <li
                      key={i}
                      className={`pl-2 ${opt === q.respuesta ? 'text-green-600 font-semibold' : 'text-gray-800'}`}
                    >
                      {opt}{opt === q.respuesta ? ' (Correcta)' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100">
          <h3 className="text-lg font-bold mb-4 text-blue-700">Resultados de los estudiantes</h3>
          {loadingRes ? (
            <div className="flex justify-center"><div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
          ) : results.length > 0 ? (
            <table className="w-full table-auto border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border p-2 text-left">Alumno</th>
                  <th className="border p-2 text-left">Puntaje</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-blue-50">
                    <td className="border p-2">{r.studentName}</td>
                    <td className="border p-2 font-bold text-blue-700">{r.score} / 20</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No hay resultados aún.</p>          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-4">Confirmar eliminación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar este examen? Esta acción no se puede deshacer y se eliminarán todos los resultados asociados.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetail;
