import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

interface ExamItem {
  id: string;
  slug: string;
  titulo: string;
}

const EvaluationsList: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/exams`);
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
          <ul className="space-y-4">
            {exams.map((ex) => (
              <li key={ex.id} className="flex justify-between items-center p-4 bg-white rounded shadow border border-gray-100">
                <span className="font-medium text-gray-800">{ex.titulo}</span>
                <button
                  onClick={() => navigate(`/evaluaciones/${ex.slug}/detalle`)}
                  className="btn btn-secondary"
                >
                  Ver examen
                </button>
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
