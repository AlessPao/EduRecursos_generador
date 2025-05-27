import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import { Clipboard } from 'lucide-react';

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
  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRes, setLoadingRes] = useState(true);
  const [copied, setCopied] = useState(false);

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

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
  if (!exam) return <p className="p-6">Examen no encontrado.</p>;

  return (
    <div className="pt-20 p-4 min-h-screen bg-gradient-to-br from-blue-50 to-white flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-2xl font-extrabold text-blue-700 mb-2 text-center drop-shadow">{exam.titulo}</h2>
          <div className="h-1 w-16 bg-blue-200 rounded mx-auto mb-6" />
          <textarea readOnly className="w-full p-3 border rounded-lg h-32 mb-6 bg-blue-50 text-gray-700 font-mono" value={exam.texto} />
          <div className="flex flex-col sm:flex-row items-center mb-6 gap-2">
            <input
              readOnly
              className="flex-1 form-input border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-blue-50"
              value={`${window.location.origin}/evaluaciones/${slug}`}
            />
            <button onClick={handleCopy} className="ml-0 sm:ml-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center transition">
              <Clipboard size={16} className="mr-1" />
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
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
            <p className="text-gray-500">No hay resultados aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;
