import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, SpellCheck, MessageCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirigir al dashboard si ya está autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  // Características del sistema
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: 'Comprensión Lectora',
      description: 'Fichas de lectura con textos adaptados y preguntas de comprensión para 2° grado.'
    },
    {
      icon: <PenTool className="h-8 w-8 text-green-600" />,
      title: 'Producción Escrita',
      description: 'Actividades estructuradas para desarrollar habilidades de escritura creativa.'
    },
    {
      icon: <SpellCheck className="h-8 w-8 text-orange-600" />,
      title: 'Gramática y Ortografía',
      description: 'Ejercicios enfocados en aspectos formales de la escritura adaptados a 2° grado.'
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-violet-600" />,
      title: 'Comunicación Oral',
      description: 'Guiones y actividades para fomentar la expresión oral de los estudiantes.'
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Encabezado */}
      <header className="bg-white shadow-sm py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">EduRecursos</span>
          </div>
          
          <div className="flex space-x-4">
            <Link to="/login" className="btn btn-secondary">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="btn btn-primary">
              Registrarse
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col justify-center py-12 sm:py-16 bg-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Recursos Educativos para 2° Grado
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
            Herramienta para docentes que genera recursos educativos personalizados para estudiantes de 2° grado, alineados con el currículo nacional.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Comenzar ahora <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.section>
      
      {/* Características */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Recursos Disponibles</h2>
            <p className="mt-4 text-lg text-gray-600">
              Genera recursos adaptados a las necesidades de tus estudiantes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Llamada a la acción */}
      <section className="py-12 sm:py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Optimiza tu tiempo de preparación de clases
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Regístrate hoy y comienza a crear recursos educativos de calidad rápidamente
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-white" />
              <span className="ml-2 text-lg font-bold text-white">EduRecursos</span>
            </div>
            <p className="mt-4 md:mt-0 text-gray-400">
              &copy; 2025 Sistema de Recursos Educativos para 2° Grado
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;