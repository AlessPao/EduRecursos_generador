import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import { Trash2, FileText, Plus, Search, BookOpen } from 'lucide-react';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { motion } from 'framer-motion';

interface ExamItem {
  id: string;
  slug: string;
  titulo: string;
  createdAt?: string;
}

const EvaluationsList: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<{ slug: string; titulo: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleDelete = async (e: React.MouseEvent, slug: string, titulo: string) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    setExamToDelete({ slug, titulo });
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;

    const { slug } = examToDelete;
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
      setExamToDelete(null);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredExams = exams.filter(exam =>
    exam.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Evaluaciones</h1>
          <p className="text-slate-600">
            Gestiona tus exámenes y evaluaciones creadas
          </p>
        </div>
        <button
          onClick={() => navigate('/evaluaciones/new')}
          className="btn btn-primary flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Crear examen
        </button>
      </div>

      {/* Search Bar */}
      {exams.length > 0 && (
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Buscar evaluación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : exams.length > 0 ? (
        filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((ex, index) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate(`/evaluaciones/${ex.slug}/detalle`)}
                className="card card-hover cursor-pointer group relative overflow-hidden border-slate-200"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => handleDelete(e, ex.slug, ex.titulo)}
                    disabled={deletingId === ex.slug}
                    className="p-2 bg-white text-rose-600 rounded-lg shadow-sm border border-rose-100 hover:bg-rose-50 transition-colors"
                    title="Eliminar examen"
                  >
                    {deletingId === ex.slug ? (
                      <div className="animate-spin h-4 w-4 border-2 border-rose-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <FileText size={24} />
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {ex.titulo}
                </h3>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    Examen
                  </span>
                  <span className="text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    Ver detalles →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No se encontraron resultados</h3>
            <p className="text-slate-500">Intenta con otro término de búsqueda</p>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tienes evaluaciones creadas</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Crea tu primer examen personalizado para tus estudiantes en segundos.
          </p>
          <button
            onClick={() => navigate('/evaluaciones/new')}
            className="btn btn-primary shadow-lg shadow-indigo-200"
          >
            Crear mi primer examen
          </button>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {examToDelete && (
        <DeleteConfirmation
          isOpen={!!examToDelete}
          onClose={() => setExamToDelete(null)}
          onConfirm={confirmDelete}
          title={examToDelete.titulo}
        />
      )}
    </div>
  );
};

export default EvaluationsList;
