import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Download, Headphones, BookOpen, PenTool, SpellCheck, MessageCircle, User } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface ResourceItemProps {
  id: number;
  tipo: string;
  titulo: string;
  createdAt: string;
  onViewResource?: (id: number) => void;
  onDelete: (id: number) => void;
  onDownload: (id: number) => void;
}

const ResourceItem: React.FC<ResourceItemProps> = ({
  id,
  tipo,
  titulo,
  createdAt,
  onViewResource,
  onDelete,
  onDownload
}) => {
  // Seleccionar el icono según el tipo
  const getIcon = () => {
    switch (tipo) {
      case 'comprension':
        return <BookOpen size={20} className="text-blue-600" />;
      case 'escritura':
        return <PenTool size={20} className="text-green-600" />;
      case 'gramatica':
        return <SpellCheck size={20} className="text-orange-600" />;
      case 'oral':
        return <MessageCircle size={20} className="text-violet-600" />;
      case 'drag_and_drop':
        return <span role="img" aria-label="Puzzle" className="text-pink-600">🧩</span>;
      default:
        return <BookOpen size={20} className="text-blue-600" />;
    }
  };
  
  // Obtener el color de la etiqueta según el tipo
  const getBadgeColor = () => {
    switch (tipo) {
      case 'comprension':
        return 'bg-blue-100 text-blue-800';
      case 'escritura':
        return 'bg-green-100 text-green-800';
      case 'gramatica':
        return 'bg-orange-100 text-orange-800';
      case 'oral':
        return 'bg-violet-100 text-violet-800';
      case 'drag_and_drop':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Obtener el nombre del tipo
  const getTipoNombre = () => {
    switch (tipo) {
      case 'comprension':
        return 'Comprensión lectora';
      case 'escritura':
        return 'Producción escrita';
      case 'gramatica':
        return 'Gramática y ortografía';
      case 'oral':
        return 'Comunicación oral';
      case 'drag_and_drop':
        return 'Juegos interactivos';
      default:
        return tipo;
    }
  };
  
  // Si el recurso es de tipo drag_and_drop, solo mostrar opciones Jugar y Borrar
  if (tipo === 'drag_and_drop') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-start mb-3 md:mb-0">
            <div className="p-2 rounded-full bg-gray-100 mr-3">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()}`}>
                  {getTipoNombre()}
                </span>
                <span className="text-xs text-gray-500">
                  Creado: {formatDate(createdAt)}
                </span>
              </div>
              <Link 
                to={`/recursos/${id}`} 
                className="text-lg font-medium hover:text-blue-600 transition-colors"
              >
                {titulo}
              </Link>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/juegos/${id}`}
              className="btn btn-sm btn-accent flex items-center gap-1"
              title="Jugar actividad interactiva"
            >
              <span role="img" aria-label="Jugar">🎮</span>
              <span className="hidden sm:inline">Jugar</span>
            </Link>
            <button
              onClick={() => onDelete(id)}
              className="btn btn-sm btn-danger flex items-center gap-1"
              title="Eliminar recurso"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-start mb-3 md:mb-0">
          <div className="p-2 rounded-full bg-gray-100 mr-3">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()}`}>
                {getTipoNombre()}
              </span>
              <span className="text-xs text-gray-500">
                Creado: {formatDate(createdAt)}
              </span>
            </div>
            <Link 
              to={`/recursos/${id}`} 
              className="text-lg font-medium hover:text-blue-600 transition-colors"
            >
              {titulo}
            </Link>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/recursos/${id}`}
            className="btn btn-sm btn-secondary flex items-center gap-1"
            title="Ver y escuchar recurso"
          >
            <Headphones size={16} />
            <span className="hidden sm:inline">Escuchar</span>
          </Link>
          <Link
            to={`/estudiante/${id}`}
            className="btn btn-sm btn-accent flex items-center gap-1"
            title="Vista estudiante (flipcards)"
          >
            <User size={16} />
            <span className="hidden sm:inline">Vista estudiante</span>
          </Link>
          <Link
            to={`/recursos/${id}/editar`}
            className="btn btn-sm btn-secondary flex items-center gap-1"
            title="Editar recurso"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Editar</span>
          </Link>
          <button
            onClick={() => onDownload(id)}
            className="btn btn-sm btn-secondary flex items-center gap-1"
            title="Descargar PDF"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Descargar</span>
          </button>
          <button
            onClick={() => onDelete(id)}
            className="btn btn-sm btn-danger flex items-center gap-1"
            title="Eliminar recurso"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceItem;