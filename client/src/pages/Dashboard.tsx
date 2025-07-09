import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TIPOS_RECURSOS } from '../config';
import ResourceCard from '../components/ResourceCard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
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
    <div className="pt-20 pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido!</h1>
        <p className="text-gray-600">
          Selecciona el tipo de recurso educativo que deseas generar para 2° grado.
        </p>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {TIPOS_RECURSOS.map((tipo) => (
          <motion.div key={tipo.id} variants={itemVariants}>
            <ResourceCard
              id={tipo.id}
              title={tipo.nombre}
              description={tipo.descripcion}
              onClick={() => handleSelectResourceType(tipo.id)}
            />
          </motion.div>
        ))}
        

      </motion.div>
      
      <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          ¿Cómo funciona?
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Selecciona el tipo de recurso que necesitas crear</li>
          <li>Completa el formulario con las opciones específicas</li>
          <li>El sistema generará el recurso automáticamente</li>
          <li>Puedes guardar, editar o descargar el recurso generado</li>
          <li>Todos tus recursos guardados estarán disponibles en "Mis Recursos"</li>
          <li><strong>Nuevo:</strong> Usa el "Reporte de calidad lingüística" para evaluar la calidad de tus recursos</li>
        </ol>
      </div>
    </div>
  );
};

export default Dashboard;