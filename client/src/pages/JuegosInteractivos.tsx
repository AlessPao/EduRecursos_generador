import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const JuegosInteractivos: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recurso, setRecurso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actividadActual, setActividadActual] = useState(0);
  const [respuestas, setRespuestas] = useState<any[]>([]);
  const [resultados, setResultados] = useState<(boolean | null)[]>([]);
  const [verificado, setVerificado] = useState<boolean[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecurso = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/recursos/${id}`);
        if (res.data.success && res.data.recurso.tipo === 'drag_and_drop') {
          setRecurso(res.data.recurso);
          const numActividades = res.data.recurso.contenido.actividades.length;
          setRespuestas(Array(numActividades).fill(null).map(() => []));
          setResultados(Array(numActividades).fill(null));
          setVerificado(Array(numActividades).fill(false));
        } else {
          navigate('/recursos');
        }
      } catch (error) {
        navigate('/recursos');
      } finally {
        setLoading(false);
      }
    };
    fetchRecurso();
  }, [id, navigate]);

  // Funciones de drag and drop
  const handleDragStart = (e: React.DragEvent, palabra: string) => {
    setDraggedItem(palabra);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem && !verificado[actividadActual]) {
      agregarPalabra(draggedItem);
      setDraggedItem(null);
    }
  };
  const agregarPalabra = (palabra: string) => {
    const idx = actividadActual;
    const actividad = recurso.contenido.actividades[idx];
    
    if (verificado[idx]) return;
    
    if (actividad.tipo === 'formar_oracion') {
      // Para formar oraciones, agregar todas las palabras en orden
      if (!respuestas[idx].includes(palabra)) {
        const nuevas = [...respuestas];
        nuevas[idx] = [...nuevas[idx], palabra];
        setRespuestas(nuevas);
      }
    } else if (actividad.tipo === 'completar_oracion') {
      // Para completar oraciones, solo permitir una palabra seleccionada
      const nuevas = [...respuestas];
      nuevas[idx] = [palabra]; // Reemplazar la selección anterior
      setRespuestas(nuevas);
    }
  };

  // Verificar la actividad actual
  const verificarActividad = () => {
    if (!recurso) return;
    
    const act = recurso.contenido.actividades[actividadActual];
    const respuestaUsuario = respuestas[actividadActual];
    
    let esCorrecto = false;
    if (act.tipo === 'formar_oracion') {
      esCorrecto = JSON.stringify(respuestaUsuario) === JSON.stringify(act.respuesta);
    } else if (act.tipo === 'completar_oracion') {
      esCorrecto = JSON.stringify(respuestaUsuario) === JSON.stringify(act.respuesta);
    }
    
    const nuevosResultados = [...resultados];
    nuevosResultados[actividadActual] = esCorrecto;
    setResultados(nuevosResultados);
    
    const nuevosVerificados = [...verificado];
    nuevosVerificados[actividadActual] = true;
    setVerificado(nuevosVerificados);
  };

  // Reiniciar la actividad actual
  const reiniciarActividad = () => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[actividadActual] = [];
    setRespuestas(nuevasRespuestas);
    
    const nuevosResultados = [...resultados];
    nuevosResultados[actividadActual] = null;
    setResultados(nuevosResultados);
    
    const nuevosVerificados = [...verificado];
    nuevosVerificados[actividadActual] = false;
    setVerificado(nuevosVerificados);
  };

  // Navegación entre actividades
  const anteriorActividad = () => {
    if (actividadActual > 0) {
      setActividadActual(actividadActual - 1);
    }
  };

  const siguienteActividad = () => {
    if (actividadActual < recurso.contenido.actividades.length - 1) {
      setActividadActual(actividadActual + 1);
    }
  };
  // Renderizado de cada actividad
  const renderActividad = (act: any) => {
    const idx = actividadActual;
    
    if (act.tipo === 'formar_oracion') {
      return (
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-800">{act.enunciado}</div>
          
          {/* Palabras disponibles */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Palabras disponibles:</div>
            <div className="flex flex-wrap gap-2">
              {act.opciones.map((palabra: string, i: number) => (
                <div
                  key={i}
                  draggable={!respuestas[idx].includes(palabra) && !verificado[idx]}
                  onDragStart={(e) => handleDragStart(e, palabra)}
                  className={`px-3 py-2 rounded-lg border transition-all cursor-pointer select-none ${
                    respuestas[idx].includes(palabra) 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                      : verificado[idx]
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:shadow-md transform hover:scale-105'
                  }`}
                  onClick={() => !respuestas[idx].includes(palabra) && agregarPalabra(palabra)}
                >
                  {palabra}
                  {!respuestas[idx].includes(palabra) && !verificado[idx] && (
                    <div className="text-xs text-gray-500 mt-1">Arrastra o haz clic</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Área de construcción de oración */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Tu oración:</div>
            <div 
              className="min-h-[80px] border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                borderColor: draggedItem ? '#3B82F6' : '#D1D5DB',
                backgroundColor: draggedItem ? '#EFF6FF' : '#F9FAFB'
              }}
            >
              <div className="flex flex-wrap gap-2">
                {respuestas[idx].map((palabra: string, i: number) => (
                  <span 
                    key={i} 
                    className="px-3 py-2 rounded-md bg-blue-100 border border-blue-300 text-blue-800 font-medium"
                  >
                    {palabra}
                  </span>
                ))}
                {respuestas[idx].length === 0 && (
                  <span className="text-gray-400 italic flex items-center">
                    {draggedItem ? '¡Suelta aquí la palabra!' : 'Arrastra las palabras aquí para formar la oración'}
                  </span>
                )}
              </div>
            </div>
            {!verificado[idx] && respuestas[idx].length > 0 && (
              <button
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline transition-colors"
                onClick={() => {
                  const nuevas = [...respuestas];
                  nuevas[idx] = [];
                  setRespuestas(nuevas);
                }}
              >
                Limpiar oración
              </button>
            )}
          </div>
        </div>
      );    } else if (act.tipo === 'completar_oracion') {
      return (
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-800">{act.enunciado}</div>
            {/* Palabras disponibles */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Opciones disponibles:</div>
            <div className="grid grid-cols-2 gap-2">
              {act.opciones.map((palabra: string, i: number) => {
                const estaSeleccionada = respuestas[idx].includes(palabra);
                const esLaSeleccionada = respuestas[idx][0] === palabra;
                
                return (
                  <div
                    key={i}
                    draggable={!verificado[idx]}
                    onDragStart={(e) => handleDragStart(e, palabra)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer select-none text-center font-medium ${
                      verificado[idx]
                        ? estaSeleccionada 
                          ? resultados[idx] 
                            ? 'bg-green-100 border-green-500 text-green-800' 
                            : 'bg-red-100 border-red-500 text-red-800'
                          : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                        : estaSeleccionada
                        ? 'bg-blue-100 border-blue-500 text-blue-800 ring-2 ring-blue-200'
                        : 'bg-white hover:bg-green-50 border-green-200 text-green-700 hover:shadow-md transform hover:scale-105'
                    }`}
                    onClick={() => !verificado[idx] && agregarPalabra(palabra)}
                  >
                    {palabra}
                    {!verificado[idx] && (
                      <div className="text-xs text-gray-500 mt-1">
                        {estaSeleccionada ? 'Seleccionada' : 'Haz clic para elegir'}
                      </div>
                    )}
                    {verificado[idx] && estaSeleccionada && (
                      <div className="text-xs mt-1">
                        {resultados[idx] ? '✓ Correcto' : '✗ Incorrecto'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Mostrar selección actual */}
          {respuestas[idx].length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800 mb-2">Tu selección:</div>
              <div className="text-lg font-semibold text-blue-900">
                {act.enunciado.replace('_____', `"${respuestas[idx][0]}"`)}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!recurso) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Recurso no encontrado</h2>
          <button
            onClick={() => navigate('/recursos')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Volver a recursos
          </button>
        </div>
      </div>
    );
  }

  const actividadActiva = recurso.contenido.actividades[actividadActual];
  const totalActividades = recurso.contenido.actividades.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Cabecera */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/recursos')}
            className="mr-4 p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{recurso.titulo}</h1>
        </div>

        {/* Indicador de progreso */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Actividad {actividadActual + 1} de {totalActividades}
            </span>
            <span className="text-sm text-gray-500">
              {actividadActiva.tipo === 'formar_oracion' ? 'Formar oración' : 'Completar oración'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((actividadActual + 1) / totalActividades) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Contenido de la actividad */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {renderActividad(actividadActiva)}
          
          {/* Resultado de verificación */}
          {verificado[actividadActual] && (
            <div className={`mt-6 p-4 rounded-lg ${
              resultados[actividadActual] 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {resultados[actividadActual] ? (
                  <>
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-green-800 font-semibold">¡Correcto! Excelente trabajo.</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">✗</span>
                    </div>
                    <span className="text-red-800 font-semibold">Incorrecto. Intenta de nuevo.</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between">
          {/* Navegación */}
          <div className="flex space-x-2">
            <button
              onClick={anteriorActividad}
              disabled={actividadActual === 0}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                actividadActual === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronLeft size={18} className="mr-1" />
              Anterior
            </button>
            <button
              onClick={siguienteActividad}
              disabled={actividadActual === totalActividades - 1}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                actividadActual === totalActividades - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Siguiente
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>

          {/* Acciones */}
          <div className="flex space-x-2">
            {!verificado[actividadActual] ? (
              <button
                onClick={verificarActividad}
                disabled={respuestas[actividadActual].length === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  respuestas[actividadActual].length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Verificar
              </button>
            ) : (
              <button
                onClick={reiniciarActividad}
                className="px-6 py-2 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuegosInteractivos;
