import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, SpellCheck, MessageCircle, ArrowRight, Snowflake, Gamepad2, CheckCircle, Star, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Redirigir al dashboard si ya está autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  // Características del sistema
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
      title: 'Comprensión Lectora',
      description: 'Fichas de lectura con textos adaptados y preguntas de comprensión para 2° grado.'
    },
    {
      icon: <PenTool className="h-6 w-6 text-emerald-600" />,
      title: 'Producción Escrita',
      description: 'Actividades estructuradas para desarrollar habilidades de escritura creativa.'
    },
    {
      icon: <SpellCheck className="h-6 w-6 text-amber-600" />,
      title: 'Gramática y Ortografía',
      description: 'Ejercicios enfocados en aspectos formales de la escritura adaptados a 2° grado.'
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-violet-600" />,
      title: 'Comunicación Oral',
      description: 'Guiones y actividades para fomentar la expresión oral de los estudiantes.'
    },
    {
      icon: <Gamepad2 className="h-6 w-6 text-pink-600" />,
      title: 'Juegos Interactivos',
      description: 'Actividades de arrastrar y soltar: formar o completar oraciones.'
    },
    {
      icon: <Snowflake className="h-6 w-6 text-cyan-600" />,
      title: 'Ice Breakers',
      description: 'Actividades dinámicas para crear un ambiente positivo y fomentar la participación.'
    }
  ];

  const benefits = [
    "Ahorra tiempo en la planificación de clases",
    "Recursos alineados al currículo nacional",
    "Material visualmente atractivo para niños",
    "Adaptable a diferentes niveles de aprendizaje"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Encabezado */}
      <header className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">EduRecursos</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cambiar tema"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-slate-400" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </button>
              <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-primary shadow-indigo-200/50">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-slate-950 -z-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl opacity-50 -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-6">
                <Star className="w-3 h-3 mr-1" /> Nuevo: Juegos Interactivos
              </span>
              <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white sm:text-6xl lg:text-7xl tracking-tight mb-8">
                Recursos Educativos para <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">2° Grado</span>
              </h1>
              <p className="mt-6 text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Plataforma integral para docentes. Genera fichas, actividades y juegos personalizados alineados con el currículo nacional en segundos.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/register"
                  className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transform hover:-translate-y-1 transition-all duration-200"
                >
                  Comenzar Gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary text-lg px-8 py-4"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-20 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Todo lo que necesitas</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Una suite completa de herramientas diseñadas específicamente para potenciar el aprendizaje en segundo grado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card card-hover group border-slate-100"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-100">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios / CTA Intermedio */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-900 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-800 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-violet-800 rounded-full blur-3xl opacity-50"></div>

            <div className="grid md:grid-cols-2 gap-12 items-center p-12 relative z-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Transforma tu manera de enseñar
                </h2>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-indigo-100">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-900 bg-white hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                    Crear cuenta ahora
                  </Link>
                </div>
              </div>
              <div className="hidden md:block relative">
                {/* Placeholder for an illustration or screenshot */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-inner">
                  <div className="space-y-4">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                    <div className="h-32 bg-white/10 rounded-xl border border-white/10 mt-6"></div>
                    <div className="flex gap-3 mt-4">
                      <div className="h-10 w-10 rounded-full bg-white/20"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/20 rounded w-full"></div>
                        <div className="h-3 bg-white/20 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">EduRecursos</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                Ayudando a docentes a crear mejores experiencias de aprendizaje para sus estudiantes.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Registrarse</Link></li>
                <li><span className="text-slate-400 dark:text-slate-500 cursor-not-allowed">Precios (Pronto)</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacidad</Link></li>
                <li><span className="text-slate-400 dark:text-slate-500 cursor-not-allowed">Términos</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} EduRecursos. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;