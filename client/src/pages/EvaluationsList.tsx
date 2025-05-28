import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import { Trash2 } from 'lucide-react';

interface ExamItem {
  id: string;
  slug: string;
  titulo: string;
}

const EvaluationsList: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/exams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setExams(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar exámenes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el examen "${titulo}"?`)) {
      return;
    }
    
    setDeletingId(slug);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_URL}/exams/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success('Examen eliminado correctamente');
        setExams(exams.filter(exam => exam.slug !== slug));
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar el examen');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="pt-20 pb-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Mis Evaluaciones</h1>
            <p className="text-gray-600">
              {exams.length} evaluaciones disponibles
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/evaluaciones/new')}
              className="btn btn-primary"
            >
              Crear examen
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : exams.length > 0 ? (
          <ul className="space-y-4">            {exams.map((ex) => (
              <li key={ex.id} className="flex justify-between items-center p-4 bg-white rounded shadow border border-gray-100">
                <span className="font-medium text-gray-800">{ex.titulo}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/evaluaciones/${ex.slug}/detalle`)}
                    className="btn btn-secondary"
                  >
                    Ver examen
                  </button>
                  <button
                    onClick={() => handleDelete(ex.slug, ex.titulo)}
                    disabled={deletingId === ex.slug}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                    title="Eliminar examen"
                  >
                    {deletingId === ex.slug ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-white rounded-lg border p-8 text-center">
            <p className="text-gray-600 mb-4">No hay evaluaciones creadas.</p>
            <button
              onClick={() => navigate('/evaluaciones/new')}
              className="btn btn-primary"
            >
              Crear tu primer examen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationsList;
