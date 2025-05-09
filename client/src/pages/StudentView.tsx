// Add custom element type for flip-card
declare global {
    namespace JSX {
      interface IntrinsicElements {
        'flip-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      }
    }
  }
  
  import React, { useEffect, useState } from 'react';
  import { useParams } from 'react-router-dom';
  import axios from 'axios';
  import { API_URL } from '../config';
  import '@auroratide/flip-card/lib/define.js';
  import FlipCard from '../components/FlipCard';
  import { ChevronLeft, ChevronRight } from 'lucide-react';
  
  // Interfaces for better type safety
  interface Pregunta {
    pregunta: string;
    respuesta: string;
  }
  
  interface Vocabulario {
    palabra: string;
    definicion: string;
  }
  
  interface RecursoContenido {
    texto: string;
    preguntas: Pregunta[];
    vocabulario?: Vocabulario[];
  }
  
  interface Recurso {
    id: string;
    titulo: string;
    tipo: string;
    contenido: RecursoContenido;
  }
  
  const StudentView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [recurso, setRecurso] = useState<Recurso | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<'preguntas' | 'vocabulario'>('preguntas');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
    useEffect(() => {
      const fetchRecurso = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`${API_URL}/recursos/${id}`);
          if (res.data.success) {
            setRecurso(res.data.recurso);
          }
        } catch (error) {
          setRecurso(null);
        } finally {
          setLoading(false);
        }
      };
      fetchRecurso();
    }, [id]);
  
    useEffect(() => {
      // Reset card index when changing sections
      setCurrentCardIndex(0);
    }, [activeSection]);
  
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
  
    if (!recurso) {
      return (
        <div className="text-center py-16 px-4">
          <div className="text-red-500 text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700">Recurso no encontrado</h2>
          <p className="mt-2 text-gray-500">El recurso que buscas no está disponible o ha sido eliminado.</p>
        </div>
      );
    }
  
    // Solo implementado para tipo comprension
    if (recurso.tipo !== 'comprension') {
      return (
        <div className="text-center py-16 px-4">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-700">Modo no disponible</h2>
          <p className="mt-2 text-gray-500">
            Este modo solo está disponible para recursos de comprensión lectora.
          </p>
        </div>
      );
    }
  
    const currentCards = activeSection === 'preguntas' 
      ? recurso.contenido.preguntas 
      : recurso.contenido.vocabulario || [];
  
    const navigateCards = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
        setCurrentCardIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else {
        setCurrentCardIndex(prev => (prev < currentCards.length - 1 ? prev + 1 : prev));
      }
    };
  
    const currentCard = currentCards[currentCardIndex];
    const hasCards = currentCards.length > 0;
  
    return (
      <div className="pt-20 pb-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">{recurso.titulo}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>
  
        {/* Texto */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-indigo-500">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center">
            <span className="mr-2">📚</span> Texto
          </h2>
          <div className="text-gray-800 whitespace-pre-line leading-relaxed">
            {recurso.contenido.texto}
          </div>
        </div>
  
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-full shadow-md p-1 flex space-x-1">
            <button
              onClick={() => setActiveSection('preguntas')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeSection === 'preguntas'
                  ? 'bg-indigo-500 text-white shadow-md transform scale-105'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Preguntas ({recurso.contenido.preguntas.length})
            </button>
            {recurso.contenido.vocabulario && recurso.contenido.vocabulario.length > 0 && (
              <button
                onClick={() => setActiveSection('vocabulario')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSection === 'vocabulario'
                    ? 'bg-indigo-500 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Vocabulario ({recurso.contenido.vocabulario.length})
              </button>
            )}
          </div>
        </div>
  
        {/* Card Display */}
        <div className="flex flex-col items-center">
          {hasCards ? (
            <>
              {/* Card Navigator */}
              <div className="w-full max-w-md mx-auto mb-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateCards('prev')}
                    disabled={currentCardIndex === 0}
                    className={`p-2 rounded-full ${
                      currentCardIndex === 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-indigo-600 hover:bg-indigo-100'
                    } transition-all focus:outline-none`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="text-sm text-gray-500">
                    {currentCardIndex + 1} de {currentCards.length}
                  </div>
                  <button
                    onClick={() => navigateCards('next')}
                    disabled={currentCardIndex === currentCards.length - 1}
                    className={`p-2 rounded-full ${
                      currentCardIndex === currentCards.length - 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-indigo-600 hover:bg-indigo-100'
                    } transition-all focus:outline-none`}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
  
              {/* Current Card */}
              <div className="w-full max-w-md">
                {activeSection === 'preguntas' && (
                  <FlipCard
                    front={<div className="font-bold text-indigo-700">{currentCard.pregunta}</div>}
                    back={<div className="text-emerald-700">{currentCard.respuesta}</div>}
                  />
                )}
                
                {activeSection === 'vocabulario' && recurso.contenido.vocabulario && (
                  <FlipCard
                    front={<div className="font-bold text-purple-700">{currentCard.palabra}</div>}
                    back={<div className="text-gray-700">{(currentCard as Vocabulario).definicion}</div>}
                  />
                )}
              </div>
  
              <p className="text-center text-sm text-gray-500 mt-4">
                Haz clic en la tarjeta para revelar la respuesta
              </p>
            </>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay {activeSection} disponibles</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default StudentView;