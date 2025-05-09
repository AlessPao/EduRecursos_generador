import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import ResourceItem from '../components/ResourceItem';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { Search, Plus } from 'lucide-react';

const RecursosList: React.FC = () => {
  const navigate = useNavigate();
  const [recursos, setRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: 0, title: '' });
  
  // Cargar recursos
  const fetchRecursos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/recursos`);
      if (res.data.success) {
        setRecursos(res.data.recursos);
      }
    } catch (error) {
      console.error('Error al cargar recursos:', error);
      toast.error('No se pudieron cargar los recursos');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar recursos al montar el componente
  useEffect(() => {
    fetchRecursos();
  }, []);
  
  // Filtrar recursos
  const filteredRecursos = recursos.filter(recurso => {
    // Filtrar por término de búsqueda
    const matchesTerm = recurso.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por tipo
    const matchesTipo = tipoFiltro ? recurso.tipo === tipoFiltro : true;
    
    return matchesTerm && matchesTipo;
  });
  
  // Abrir modal de confirmación para eliminar
  const confirmDelete = (id: number, title: string) => {
    setDeleteModal({ open: true, id, title });
  };
  
  // Eliminar recurso
  const handleDelete = async () => {
    try {
      const res = await axios.delete(`${API_URL}/recursos/${deleteModal.id}`);
      if (res.data.success) {
        setRecursos(recursos.filter(r => r.id !== deleteModal.id));
        toast.success('Recurso eliminado correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      toast.error('No se pudo eliminar el recurso');
    } finally {
      setDeleteModal({ open: false, id: 0, title: '' });
    }
  };
  
  // Descargar recurso como PDF
  const handleDownload = async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/recursos/${id}/pdf`, {
        responseType: 'blob'
      });
      
      // Obtener el título del recurso
      const recurso = recursos.find(r => r.id === id);
      const titulo = recurso ? recurso.titulo : 'recurso';
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${titulo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      toast.error('No se pudo descargar el PDF');
    }
  };
  
  // Navegar a la vista del recurso
  const handleViewResource = (id: number) => {
    navigate(`/recursos/${id}`);
  };
  
  // Ir al dashboard para crear un nuevo recurso
  const handleNewResource = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="pt-20 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Mis Recursos</h1>
          <p className="text-gray-600">
            {filteredRecursos.length} recursos disponibles
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleNewResource}
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Nuevo recurso
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Buscar recursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="md:w-64">
            <select
              className="form-select"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="comprension">Comprensión lectora</option>
              <option value="escritura">Producción escrita</option>
              <option value="gramatica">Gramática y ortografía</option>
              <option value="oral">Comunicación oral</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Lista de recursos */}
      {filteredRecursos.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredRecursos.map((recurso) => (
            <ResourceItem
              key={recurso.id}
              id={recurso.id}
              tipo={recurso.tipo}
              titulo={recurso.titulo}
              createdAt={recurso.createdAt}
              onViewResource={handleViewResource}
              onDelete={(id) => confirmDelete(id, recurso.titulo)}
              onDownload={handleDownload}
            />
          ))}
        </motion.div>
      ) : (
        <div className="bg-gray-50 rounded-lg border p-8 text-center">
          <p className="text-gray-600 mb-4">No se encontraron recursos</p>
          {tipoFiltro || searchTerm ? (
            <button
              onClick={() => {
                setTipoFiltro('');
                setSearchTerm('');
              }}
              className="btn btn-secondary"
            >
              Limpiar filtros
            </button>
          ) : (
            <button
              onClick={handleNewResource}
              className="btn btn-primary"
            >
              Crear mi primer recurso
            </button>
          )}
        </div>
      )}
      
      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmation
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={handleDelete}
        title={deleteModal.title}
      />
    </div>
  );
};

export default RecursosList;