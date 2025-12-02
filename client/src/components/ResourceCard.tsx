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
  // Seleccionar el icono y colores según el tipo
  const getTheme = () => {
    switch (id) {
      case 'comprension':
        return {
          icon: <BookOpen size={28} className="text-indigo-600" />,
          bg: 'bg-indigo-50',
          border: 'border-indigo-100',
          hover: 'group-hover:bg-indigo-100'
        };
      case 'escritura':
        return {
          icon: <PenTool size={28} className="text-emerald-600" />,
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          hover: 'group-hover:bg-emerald-100'
        };
      case 'gramatica':
        return {
          icon: <SpellCheck size={28} className="text-amber-600" />,
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          hover: 'group-hover:bg-amber-100'
        };
      case 'oral':
        return {
          icon: <MessageCircle size={28} className="text-violet-600" />,
          bg: 'bg-violet-50',
          border: 'border-violet-100',
          hover: 'group-hover:bg-violet-100'
        };
      default:
        return {
          icon: <BookOpen size={28} className="text-slate-600" />,
          bg: 'bg-slate-50',
          border: 'border-slate-100',
          hover: 'group-hover:bg-slate-100'
        };
    }
  };

  const theme = getTheme();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`group cursor-pointer h-full bg-white dark:bg-slate-800 rounded-2xl border ${theme.border} dark:border-slate-700 p-6 shadow-sm hover:shadow-xl transition-all duration-300`}
      onClick={onClick}
    >
      <div className={`w-14 h-14 rounded-2xl ${theme.bg} dark:bg-opacity-20 ${theme.hover} flex items-center justify-center mb-5 transition-colors duration-300`}>
        {theme.icon}
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>

      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export default ResourceCard;