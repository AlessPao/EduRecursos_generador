import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

interface IceBreakerData {
  id: number;
  titulo: string;
  tipo: string;
  contenido: {
    titulo: string;
    descripcion: string;
    actividades: Array<{
      nombre: string;
      instrucciones?: string;
      desarrollo?: string;
      participantes?: string;
      contenidoEspecifico?: {
        frases?: Array<{
          template: string;
          ejemplos: string[];
        }>;
        pistas?: Array<{
          orden: number;
          pista: string;
        }>;
        respuesta?: string;
        descripcion?: string;
        elementosClave?: string[];
        desafios?: Array<{
          criterio: string;
          ejemplos: string[];
        }>;
        tema?: string;
        pistasFaciles?: string[];
        extension?: string;
      };
    }>;
    objetivos?: string[];
    variaciones?: string[];
  };
}

interface SlideData {
  type: 'title' | 'activity' | 'phrase' | 'hint' | 'instruction';
  content: string;
  subContent?: string;
  activityName?: string;
}

const IceBreakerPresentation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recurso, setRecurso] = useState<IceBreakerData | null>(null);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchRecurso = async () => {
      try {
        const response = await axios.get(`${API_URL}/recursos/${id}`);
          const recursoData = response.data;
        if (recursoData.success) {
          const recurso = recursoData.recurso;
          
          // Verificar que es un recurso de ice_breakers
          if (recurso.tipo !== 'ice_breakers') {
            setError('Este recurso no es de tipo Ice Breakers');
            return;
          }
          
          setRecurso(recurso);
          
          // Generar slides basado en el contenido
          const generatedSlides = generateSlides(recurso);
          if (generatedSlides.length === 0) {
            setError('No se pudieron generar slides para este recurso');
            return;
          }
          setSlides(generatedSlides);
        } else {
          setError('Recurso no encontrado');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar el recurso:', error);
        setError('Error al cargar el recurso');
        setLoading(false);
      }
    };

    if (id) {
      fetchRecurso();
    }
  }, [id]);
  const generateSlides = (data: IceBreakerData): SlideData[] => {
    const slides: SlideData[] = [];
    
    // Slide de título
    slides.push({
      type: 'title',
      content: data.titulo,
      subContent: data.contenido?.descripcion || 'Actividades de Ice Breakers'
    });

    // Verificar que existen actividades
    if (!data.contenido?.actividades || !Array.isArray(data.contenido.actividades)) {
      console.warn('No hay actividades definidas en el recurso');
      return slides;
    }

    // Procesar cada actividad
    data.contenido.actividades.forEach((actividad, index) => {
      // Slide de nombre de actividad
      slides.push({
        type: 'activity',
        content: actividad.nombre || `Actividad ${index + 1}`,
        activityName: actividad.nombre || `Actividad ${index + 1}`
      });

      // Mostrar instrucciones si existen
      if (actividad.instrucciones) {
        slides.push({
          type: 'instruction',
          content: actividad.instrucciones,
          subContent: 'Instrucciones para el docente',
          activityName: actividad.nombre || `Actividad ${index + 1}`
        });
      }

      // Procesar contenido específico si existe
      if (actividad.contenidoEspecifico) {
        const contenido = actividad.contenidoEspecifico;        // Para "Tres cosas sobre mí" - mostrar frases
        if (contenido.frases && Array.isArray(contenido.frases)) {
          contenido.frases.forEach((frase) => {
            slides.push({
              type: 'phrase',
              content: frase.template,
              subContent: frase.ejemplos ? `Ejemplos: ${frase.ejemplos.join(', ')}` : '',
              activityName: actividad.nombre || `Actividad ${index + 1}`
            });
          });
        }

        // Para "Adivina quién soy" - mostrar pistas
        if (contenido.pistas && Array.isArray(contenido.pistas)) {
          contenido.pistas.forEach((pista) => {
            slides.push({
              type: 'hint',
              content: pista.pista,
              subContent: `Pista ${pista.orden}`,
              activityName: actividad.nombre || `Actividad ${index + 1}`
            });
          });
          
          // Mostrar respuesta al final
          if (contenido.respuesta) {
            slides.push({
              type: 'instruction',
              content: `Respuesta: ${contenido.respuesta}`,
              subContent: '¡Solución!',
              activityName: actividad.nombre || `Actividad ${index + 1}`
            });
          }
        }

        // Para "Dibuja lo que digo" - mostrar descripción
        if (contenido.descripcion) {
          slides.push({
            type: 'instruction',
            content: contenido.descripcion,
            subContent: 'Descripción para dibujar',
            activityName: actividad.nombre || `Actividad ${index + 1}`
          });
          
          // Mostrar elementos clave si existen
          if (contenido.elementosClave && Array.isArray(contenido.elementosClave)) {
            contenido.elementosClave.forEach((elemento) => {
              slides.push({
                type: 'instruction',
                content: elemento,
                subContent: 'Elemento clave',
                activityName: actividad.nombre || `Actividad ${index + 1}`
              });
            });
          }
        }

        // Para desafíos de búsqueda (tipo especial de "tres cosas sobre mí")
        if (contenido.desafios && Array.isArray(contenido.desafios)) {
          contenido.desafios.forEach((desafio) => {
            slides.push({
              type: 'phrase',
              content: `Encuentra algo que ${desafio.criterio}`,
              subContent: desafio.ejemplos ? `Ejemplos: ${desafio.ejemplos.join(', ')}` : '',
              activityName: actividad.nombre || `Actividad ${index + 1}`
            });
          });
        }
      }
    });

    console.log('Slides generados:', slides);
    return slides;
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      event.preventDefault();
      nextSlide();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevSlide();
    } else if (event.key === 'Escape') {
      navigate('/recursos');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentSlide, slides.length]);

  const getSlideStyles = (slide: SlideData) => {
    switch (slide.type) {
      case 'title':
        return 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white';
      case 'activity':
        return 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white';
      case 'phrase':
        return 'bg-gradient-to-br from-green-400 to-blue-500 text-white';
      case 'hint':
        return 'bg-gradient-to-br from-orange-400 to-red-500 text-white';
      case 'instruction':
        return 'bg-gradient-to-br from-purple-400 to-pink-500 text-white';
      default:
        return 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !recurso) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error || 'Recurso no encontrado'}</p>
          <button
            onClick={() => navigate('/recursos')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
          >
            Volver a recursos
          </button>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Controles de navegación */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/recursos')}
          className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
          title="Salir (Esc)"
        >
          <X size={24} />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-20 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Controles de navegación principales */}
      <div className="absolute inset-y-0 left-0 flex items-center z-10">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`ml-4 p-3 rounded-full transition-all ${
            currentSlide === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-black bg-opacity-50 hover:bg-opacity-70 text-white'
          }`}
          title="Anterior (←)"
        >
          <ChevronLeft size={32} />
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center z-10">
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`mr-4 p-3 rounded-full transition-all ${
            currentSlide === slides.length - 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-black bg-opacity-50 hover:bg-opacity-70 text-white'
          }`}
          title="Siguiente (→ o Espacio)"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Contenido de la diapositiva */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className={`min-h-screen flex items-center justify-center p-8 ${getSlideStyles(currentSlideData)}`}
        >
          <div className="text-center max-w-4xl">
            {currentSlideData.type === 'title' && (
              <>
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl font-bold mb-8"
                >
                  {currentSlideData.content}
                </motion.h1>
                {currentSlideData.subContent && (
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl opacity-90"
                  >
                    {currentSlideData.subContent}
                  </motion.p>
                )}
              </>
            )}

            {currentSlideData.type === 'activity' && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl opacity-90 mb-4"
                >
                  Actividad
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-bold"
                >
                  {currentSlideData.content}
                </motion.h1>
              </>
            )}

            {(currentSlideData.type === 'phrase' || currentSlideData.type === 'hint' || currentSlideData.type === 'instruction') && (
              <>
                {currentSlideData.subContent && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl opacity-90 mb-6"
                  >
                    {currentSlideData.subContent}
                  </motion.div>
                )}
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-bold leading-tight"
                >
                  {currentSlideData.content}
                </motion.h1>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicador de progreso */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white bg-opacity-40 hover:bg-opacity-60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instrucciones de navegación */}
      <div className="absolute bottom-4 right-4 z-20 text-white text-sm opacity-70">
        <div className="bg-black bg-opacity-50 rounded-lg p-3">
          <div>← → Navegar</div>
          <div>ESC Salir</div>
        </div>
      </div>
    </div>
  );
};

export default IceBreakerPresentation;
