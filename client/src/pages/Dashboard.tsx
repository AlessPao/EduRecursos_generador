import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TIPOS_RECURSOS } from '../config';
import ResourceCard from '../components/ResourceCard';
import { ChevronDown, ChevronUp, Sparkles, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showGuide, setShowGuide] = useState(true);

  // Manejar la selección de un tipo de recurso
  const handleSelectResourceType = (tipo: string) => {
    navigate(`/recursos/nuevo/${tipo}`);
  };

  // Animaciones para los elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-10 relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 flex items-center">
            Hola, {user?.nombre || 'Docente'} <span className="ml-3 text-2xl">👋</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            ¿Qué material educativo te gustaría crear hoy? Selecciona una opción para comenzar.
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {TIPOS_RECURSOS.map((tipo) => (
          <motion.div key={tipo.id} variants={itemVariants} className="h-full">
            <ResourceCard
              id={tipo.id}
              title={tipo.nombre}
              description={tipo.descripcion}
              onClick={() => handleSelectResourceType(tipo.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* How it works Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-lg mr-4 text-indigo-600">
              <Lightbulb size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">¿Cómo funciona EduRecursos?</h2>
              <p className="text-sm text-slate-500">Guía rápida para generar tus materiales</p>
            </div>
          </div>
          {showGuide ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
        </button>

        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3">1</div>
                    <h3 className="font-semibold text-slate-800 mb-2">Elige el tipo</h3>
                    <p className="text-sm text-slate-600">Selecciona entre comprensión lectora, escritura, gramática o juegos.</p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3">2</div>
                    <h3 className="font-semibold text-slate-800 mb-2">Personaliza</h3>
                    <p className="text-sm text-slate-600">Define el tema, nivel de dificultad y objetivos específicos de aprendizaje.</p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3">3</div>
                    <h3 className="font-semibold text-slate-800 mb-2">Genera y Descarga</h3>
                    <p className="text-sm text-slate-600">Obtén tu recurso listo para imprimir o compartir con tus estudiantes.</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-indigo-50 rounded-xl flex items-start">
                  <Sparkles className="text-indigo-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <p className="text-sm text-indigo-800">
                    <strong>Nuevo:</strong> Ahora puedes usar el "Reporte de calidad lingüística" para asegurar que tus textos sean apropiados para el nivel de tus estudiantes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;