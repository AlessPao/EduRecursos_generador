import React from 'react';

interface ResourcePreviewProps {
  tipo: string;
  contenido: any;
}

const ResourcePreview: React.FC<ResourcePreviewProps> = ({ tipo, contenido }) => {
  // Renderizar según el tipo de recurso
  const renderContent = () => {
    if (!contenido) return <p>No hay contenido para mostrar</p>;
    
    switch (tipo) {
      case 'comprension':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-gray-800">{contenido.texto}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Preguntas</h3>
              <div className="space-y-3">
                {contenido.preguntas.map((pregunta: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <p className="font-medium">{index + 1}. {pregunta.pregunta}</p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Respuesta:</span> {pregunta.respuesta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {contenido.vocabulario && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Vocabulario</h3>
                <div className="bg-yellow-50 p-3 rounded-md">
                  {contenido.vocabulario.map((item: any, index: number) => (
                    <div key={index} className="mb-2">
                      <span className="font-medium">{item.palabra}:</span> {item.definicion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'escritura':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-gray-800">{contenido.descripcion}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Instrucciones</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p>{contenido.instrucciones}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Estructura Propuesta</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p>{contenido.estructuraPropuesta}</p>
              </div>
            </div>
            
            {contenido.conectores && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Conectores Útiles</h3>
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex flex-wrap gap-2">
                    {contenido.conectores.map((conector: string, index: number) => (
                      <span key={index} className="bg-white px-2 py-1 rounded-md text-sm border">
                        {conector}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Lista de Verificación</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <ul className="list-disc list-inside">
                  {contenido.listaVerificacion.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 'gramatica':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-md">
              <p className="font-medium">Instrucciones:</p>
              <p className="text-gray-800">{contenido.instrucciones}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Ejemplo</h3>
              <div className="bg-yellow-50 p-3 rounded-md">
                <p>{contenido.ejemplo}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Ejercicios</h3>
              <div className="space-y-3">
                {contenido.items.map((item: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <p className="font-medium">{index + 1}. {item.consigna}</p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Respuesta:</span> {item.respuesta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'oral':
        return (
          <div className="space-y-4">
            <div className="bg-violet-50 p-4 rounded-md">
              <p className="text-gray-800">{contenido.descripcion}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Instrucciones para el Docente</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p>{contenido.instruccionesDocente}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Guión para Estudiantes</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p>{contenido.guionEstudiante}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Preguntas Orientadoras</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <ol className="list-decimal list-inside">
                  {contenido.preguntasOrientadoras.map((pregunta: string, index: number) => (
                    <li key={index}>{pregunta}</li>
                  ))}
                </ol>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Criterios de Evaluación</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <ul className="list-disc list-inside">
                  {contenido.criteriosEvaluacion.map((criterio: string, index: number) => (
                    <li key={index}>{criterio}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 'drag_and_drop':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">{contenido.titulo}</h3>
              <p className="text-sm text-gray-600">
                {contenido.actividades?.length} actividad{contenido.actividades?.length !== 1 ? 'es' : ''} interactiva{contenido.actividades?.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {contenido.actividades?.map((actividad: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">
                    Actividad {index + 1}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    actividad.tipo === 'formar_oracion' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {actividad.tipo === 'formar_oracion' ? 'Formar oración' : 'Completar oración'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Instrucción:</p>
                    <p className="text-gray-800">{actividad.enunciado}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Palabras disponibles:</p>
                    <div className="flex flex-wrap gap-2">
                      {actividad.opciones?.map((palabra: string, i: number) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm"
                        >
                          {palabra}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Respuesta correcta:</p>
                    <div className="flex flex-wrap gap-2">
                      {actividad.respuesta?.map((palabra: string, i: number) => (
                        <span 
                          key={i}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            actividad.tipo === 'formar_oracion'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}
                        >
                          {palabra}
                        </span>
                      ))}
                    </div>
                    {actividad.tipo === 'formar_oracion' && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        Oración formada: "{actividad.respuesta?.join(' ')}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los estudiantes podrán arrastrar y soltar las palabras, 
                o hacer clic para seleccionarlas. Cada actividad incluye verificación automática 
                con retroalimentación visual.
              </p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(contenido, null, 2)}
            </pre>
          </div>
        );
    }
  };
  
  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 overflow-auto max-h-[600px]">
      {renderContent()}
    </div>
  );
};

export default ResourcePreview;