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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">{recurso.titulo}</h1>
          <div className="w-20 h-1.5 bg-indigo-500 mx-auto rounded-full opacity-80"></div>
        </div>

        {/* Texto */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 md:p-10 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 dark:bg-indigo-400"></div>
          <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center">
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3">📚</span>
            Lectura
          </h2>
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
            {recurso.contenido.texto.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Interactive Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-1.5 flex space-x-2">
              <button
                onClick={() => setActiveSection('preguntas')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeSection === 'preguntas'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`}
              >
                Preguntas ({recurso.contenido.preguntas.length})
              </button>
              {recurso.contenido.vocabulario && recurso.contenido.vocabulario.length > 0 && (
                <button
                  onClick={() => setActiveSection('vocabulario')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeSection === 'vocabulario'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
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
              <div className="w-full max-w-lg">
                {/* Progress Bar */}
                <div className="mb-6 flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                  <span>Progreso</span>
                  <span>{currentCardIndex + 1} / {currentCards.length}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-8 overflow-hidden">
                  <div
                    className="bg-indigo-500 dark:bg-indigo-400 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${((currentCardIndex + 1) / currentCards.length) * 100}%` }}
                  ></div>
                </div>

                {/* Current Card */}
                <div className="mb-8 perspective-1000">
                  {activeSection === 'preguntas' && (
                    <FlipCard
                      front={
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Pregunta</span>
                          <div className="text-xl font-bold text-slate-800 leading-snug">{(currentCard as Pregunta).pregunta}</div>
                          <div className="mt-6 text-sm text-slate-400 font-medium flex items-center">
                            <span className="mr-2">👆</span> Toca para ver la respuesta
                          </div>
                        </div>
                      }
                      back={
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-indigo-50/50">
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Respuesta</span>
                          <div className="text-lg font-medium text-slate-700 leading-relaxed">{(currentCard as Pregunta).respuesta}</div>
                        </div>
                      }
                    />
                  )}

                  {activeSection === 'vocabulario' && recurso.contenido.vocabulario && (
                    <FlipCard
                      front={
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Palabra</span>
                          <div className="text-2xl font-bold text-slate-800">{(currentCard as Vocabulario).palabra}</div>
                          <div className="mt-6 text-sm text-slate-400 font-medium flex items-center">
                            <span className="mr-2">👆</span> Toca para ver la definición
                          </div>
                        </div>
                      }
                      back={
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-purple-50/50">
                          <span className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-4">Definición</span>
                          <div className="text-lg font-medium text-slate-700 leading-relaxed">{(currentCard as Vocabulario).definicion}</div>
                        </div>
                      }
                    />
                  )}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between px-4">
                  <button
                    onClick={() => navigateCards('prev')}
                    disabled={currentCardIndex === 0}
                    className={`p-3 rounded-xl transition-all duration-200 flex items-center space-x-2 ${currentCardIndex === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                      }`}
                  >
                    <ChevronLeft size={24} />
                    <span className="font-semibold hidden sm:inline">Anterior</span>
                  </button>

                  <button
                    onClick={() => navigateCards('next')}
                    disabled={currentCardIndex === currentCards.length - 1}
                    className={`p-3 rounded-xl transition-all duration-200 flex items-center space-x-2 ${currentCardIndex === currentCards.length - 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                      }`}
                  >
                    <span className="font-semibold hidden sm:inline">Siguiente</span>
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 w-full">
                <p className="text-slate-500 font-medium">No hay {activeSection} disponibles para este recurso.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView;