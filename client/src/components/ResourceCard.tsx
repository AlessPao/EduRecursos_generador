import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, SpellCheck, MessageCircle } from 'lucide-react';

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  onClick: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  title,
  description,
  onClick
}) => {
  // Seleccionar el icono según el tipo
  const getIcon = () => {
    switch (id) {
      case 'comprension':
        return <BookOpen size={32} className="text-blue-600" />;
      case 'escritura':
        return <PenTool size={32} className="text-green-600" />;
      case 'gramatica':
        return <SpellCheck size={32} className="text-orange-600" />;
      case 'oral':
        return <MessageCircle size={32} className="text-violet-600" />;
      default:
        return <BookOpen size={32} className="text-blue-600" />;
    }
  };
  
  // Obtener el color de fondo según el tipo
  const getBgColor = () => {
    switch (id) {
      case 'comprension':
        return 'bg-blue-50 border-blue-200';
      case 'escritura':
        return 'bg-green-50 border-green-200';
      case 'gramatica':
        return 'bg-orange-50 border-orange-200';
      case 'oral':
        return 'bg-violet-50 border-violet-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer rounded-xl border ${getBgColor()} p-6 transition-all duration-200 shadow-sm hover:shadow-md`}
      onClick={onClick}
    >
      <div className="mb-4">{getIcon()}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
};

export default ResourceCard;