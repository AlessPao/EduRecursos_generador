import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import { TIPOS_RECURSOS, OPCIONES_FORMULARIO, API_URL, OpcionesFormulario } from '../config';
import ResourcePreview from '../components/ResourcePreview';
import { formatTipoRecurso } from '../utils/formatters';
import { Edit, Save, Download, ArrowLeft } from 'lucide-react';

// Tipo para los datos del formulario
interface RecursoFormData {
  titulo: string;
  tipo: string;
  opciones: {
    [key: string]: string | number | boolean;
  };
}

const RecursoForm: React.FC = () => {
  const { tipo, id } = useParams<{ tipo?: string; id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [recurso, setRecurso] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContenido, setEditableContenido] = useState<any>(null);
  
  // Determinar si estamos editando o creando
  const isCreating = !id;
  
  // Tipo de recurso a generar
  const tipoRecurso = isCreating ? tipo : recurso?.tipo;
  
  // Título basado en la acción y tipo
  const tituloAccion = isCreating
    ? `Generar ${tipoRecurso === 'drag_and_drop' ? 'juegos interactivos' : formatTipoRecurso(tipoRecurso || '')}`
    : 'Editar Recurso';
  
  // Buscar la información del tipo de recurso
  const tipoInfo = TIPOS_RECURSOS.find(t => t.id === tipoRecurso);
  
  // Opciones del formulario según el tipo
  const opcionesFormulario = tipoRecurso ? OPCIONES_FORMULARIO[tipoRecurso as keyof OpcionesFormulario] || {} : {};
  
  // Configuración de React Hook Form
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<RecursoFormData>();
  
  // Cargar recurso si estamos editando
  useEffect(() => {
    if (id) {
      const fetchRecurso = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`${API_URL}/recursos/${id}`);
          if (res.data.success) {
            setRecurso(res.data.recurso);
            
            // Inicializar formulario con datos existentes
            reset({
              titulo: res.data.recurso.titulo,
              tipo: res.data.recurso.tipo,
              opciones: res.data.recurso.meta.opciones
            });
          }
        } catch (error) {
          console.error('Error al cargar el recurso:', error);
          toast.error('No se pudo cargar el recurso');
          navigate('/recursos');
        } finally {
          setLoading(false);
        }
      };
      
      fetchRecurso();
    }
  }, [id, reset, navigate]);

  // Cuando se activa la edición, inicializar el contenido editable
  useEffect(() => {
    if (isEditing && recurso) {
      setEditableContenido(JSON.parse(JSON.stringify(recurso.contenido)));
    }
  }, [isEditing, recurso]);
  
  // Manejar envío del formulario
  const onSubmit = async (data: RecursoFormData) => {
    try {
      setGenerando(true);
      
      if (isCreating) {
        // Generar nuevo recurso
        const res = await axios.post(`${API_URL}/recursos`, {
          tipo: tipoRecurso,
          titulo: data.titulo,
          opciones: data.opciones
        });
        
        if (res.data.success) {
          setRecurso(res.data.recurso);
          toast.success('Recurso generado correctamente');
        }
      } else if (isEditing) {
        // Actualizar recurso existente
        const res = await axios.put(`${API_URL}/recursos/${id}`, {
          titulo: data.titulo,
          contenido: editableContenido
        });
        
        if (res.data.success) {
          setRecurso(res.data.recurso);
          setIsEditing(false);
          toast.success('Recurso actualizado correctamente');
        }
      }
    } catch (error) {
      console.error('Error al procesar el recurso:', error);
      toast.error('Ocurrió un error al procesar el recurso');
    } finally {
      setGenerando(false);
    }
  };
  
  // Descargar recurso como PDF
  const handleDownload = async () => {
    try {
      if (!id) {
        toast.error('Primero debe guardar el recurso');
        return;
      }
      
      const response = await axios.get(`${API_URL}/recursos/${id}/pdf`, {
        responseType: 'blob'
      });
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${recurso.titulo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      toast.error('No se pudo descargar el PDF');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="pt-20 pb-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{tituloAccion}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="titulo" className="form-label">
                  Título del recurso
                </label>
                <input
                  id="titulo"
                  type="text"
                  className={`form-input ${errors.titulo ? 'border-red-500' : ''}`}
                  placeholder="Ej: Ficha de lectura - El pequeño zorro"
                  disabled={generando || (!!recurso && !isEditing)}
                  {...register('titulo', { required: 'El título es requerido' })}
                />
                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
                )}
              </div>
              
              {isCreating && (
                <>
                  <div className="form-group">
                    <label className="form-label">Tipo de recurso</label>
                    <p className="text-gray-700 py-2">
                      {tipoInfo?.nombre || formatTipoRecurso(tipoRecurso || '')}
                    </p>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4">Opciones específicas</h3>
                  
                  {/* Opciones dinámicas según el tipo de recurso */}
                  {tipoRecurso === 'comprension' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="tipoTexto" className="form-label">
                          Tipo de texto
                        </label>
                        <select
                          id="tipoTexto"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.tipoTexto', { required: true })}
                        >
                          {opcionesFormulario.tipoTexto?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tema" className="form-label">
                          Tema del texto
                        </label>
                        <input
                          id="tema"
                          type="text"
                          className="form-input"
                          placeholder="Ej: Animales, amistad, la escuela"
                          disabled={generando}
                          {...register('opciones.tema', { required: true })}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="longitud" className="form-label">
                          Longitud del texto
                        </label>
                        <select
                          id="longitud"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.longitud', { required: true })}
                        >
                          {opcionesFormulario.longitud?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="form-group">
                          <label htmlFor="numLiteral" className="form-label">
                            Preguntas literales
                          </label>
                          <input
                            id="numLiteral"
                            type="number"
                            min="1"
                            max="5"
                            className="form-input"
                            disabled={generando}
                            {...register('opciones.numLiteral', { 
                              required: true,
                              min: 1,
                              max: 5
                            })}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="numInferencial" className="form-label">
                            Preguntas inferenciales
                          </label>
                          <input
                            id="numInferencial"
                            type="number"
                            min="1"
                            max="5"
                            className="form-input"
                            disabled={generando}
                            {...register('opciones.numInferencial', { 
                              required: true,
                              min: 1,
                              max: 5
                            })}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="numCritica" className="form-label">
                            Preguntas críticas
                          </label>
                          <input
                            id="numCritica"
                            type="number"
                            min="1"
                            max="5"
                            className="form-input"
                            disabled={generando}
                            {...register('opciones.numCritica', { 
                              required: true,
                              min: 1,
                              max: 5
                            })}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {tipoRecurso === 'escritura' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="tipoTexto" className="form-label">
                          Tipo de texto
                        </label>
                        <select
                          id="tipoTexto"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.tipoTexto', { required: true })}
                        >
                          {opcionesFormulario.tipoTexto?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tema" className="form-label">
                          Tema o situación comunicativa
                        </label>
                        <input
                          id="tema"
                          type="text"
                          className="form-input"
                          placeholder="Ej: Mi mascota favorita, un día en el parque"
                          disabled={generando}
                          {...register('opciones.tema', { required: true })}
                        />
                      </div>
                    </>
                  )}
                  
                  {tipoRecurso === 'gramatica' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="aspecto" className="form-label">
                          Aspecto a trabajar
                        </label>
                        <select
                          id="aspecto"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.aspecto', { required: true })}
                        >
                          {opcionesFormulario.aspecto?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tipoEjercicio" className="form-label">
                          Tipo de ejercicio
                        </label>
                        <select
                          id="tipoEjercicio"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.tipoEjercicio', { required: true })}
                        >
                          {opcionesFormulario.tipoEjercicio?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="numItems" className="form-label">
                          Número de ítems
                        </label>
                        <input
                          id="numItems"
                          type="number"
                          min="5"
                          max="15"
                          className="form-input"
                          disabled={generando}
                          {...register('opciones.numItems', { 
                            required: true,
                            min: 5,
                            max: 15
                          })}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="contexto" className="form-label">
                          Contexto o tema
                        </label>
                        <input
                          id="contexto"
                          type="text"
                          className="form-input"
                          placeholder="Ej: Animales, juegos, familia"
                          disabled={generando}
                          {...register('opciones.contexto', { required: true })}
                        />
                      </div>
                    </>
                  )}
                  
                  {tipoRecurso === 'oral' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="formato" className="form-label">
                          Formato de la actividad
                        </label>
                        <select
                          id="formato"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.formato', { required: true })}
                        >
                          {opcionesFormulario.formato?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tema" className="form-label">
                          Tema o situación comunicativa
                        </label>
                        <input
                          id="tema"
                          type="text"
                          className="form-input"
                          placeholder="Ej: Mi familia, mis juguetes favoritos"
                          disabled={generando}
                          {...register('opciones.tema', { required: true })}
                        />
                      </div>
                    </>
                  )}
                   {tipoRecurso === 'drag_and_drop' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="numActividades" className="form-label">
                          Número de actividades
                        </label>
                        <select
                          id="numActividades"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.numActividades', { required: true })}
                        >
                          <option value="">Selecciona el número de actividades</option>
                          {opcionesFormulario.numActividades?.map((opcion: number) => (
                            <option key={opcion} value={opcion}>
                              {opcion} {opcion === 1 ? 'actividad' : 'actividades'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="tipoActividad" className="form-label">
                          Tipo de actividad
                        </label>
                        <select
                          id="tipoActividad"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.tipoActividad', { required: true })}
                        >
                          <option value="">Selecciona el tipo de actividad</option>
                          <option value="formar_oracion">Formar oraciones correctas (arrastrar palabras en orden)</option>
                          <option value="completar_oracion">Completar oraciones con palabras faltantes</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="longitudOracion" className="form-label">
                          Longitud de oraciones
                        </label>
                        <select
                          id="longitudOracion"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.longitudOracion', { required: true })}
                        >
                          <option value="">Selecciona la longitud de oraciones</option>
                          {opcionesFormulario.longitudOracion?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tema" className="form-label">
                          Tema de las actividades
                        </label>
                        <select
                          id="temaPredefinido"
                          className="form-select mb-2"
                          disabled={generando}
                          {...register('opciones.temaPredefinido', { required: true })}
                        >
                          <option value="">Selecciona un tema</option>
                          {opcionesFormulario.temasPredefinidos?.map((tema: string) => (
                            <option key={tema} value={tema}>
                              {tema}
                            </option>
                          ))}
                        </select>
                        
                        {/* Campo personalizado cuando se selecciona "Otro" */}
                        {watch('opciones.temaPredefinido') === 'Otro (personalizado)' && (
                          <input
                            id="temaPersonalizado"
                            type="text"
                            className="form-input mt-2"
                            placeholder="Escribe tu tema personalizado (ej: Los medios de transporte, La naturaleza)"
                            disabled={generando}
                            {...register('opciones.temaPersonalizado', { 
                              required: watch('opciones.temaPredefinido') === 'Otro (personalizado)' 
                            })}
                          />                        )}
                      </div>
                    </>
                  )}

                  {tipoRecurso === 'ice_breakers' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="tipoIceBreaker" className="form-label">
                          Tipo de ice breaker
                        </label>
                        <select
                          id="tipoIceBreaker"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.tipoIceBreaker', { required: true })}
                        >
                          <option value="">Selecciona el tipo de actividad</option>
                          <option value="adivina_quien_soy">🔍 Adivina quién soy</option>
                          <option value="dibuja_lo_que_digo">🎨 Dibuja lo que digo</option>
                          <option value="tres_cosas_sobre_mi">💭 Tres cosas sobre mí</option>
                        </select>
                      </div>

                      {/* Solo mostrar tema si es "adivina_quien_soy" */}
                      {watch('opciones.tipoIceBreaker') === 'adivina_quien_soy' && (
                        <div className="form-group">
                          <label htmlFor="tema" className="form-label">
                            Tema de las actividades
                          </label>
                          <select
                            id="tema"
                            className="form-select"
                            disabled={generando}
                            {...register('opciones.tema', { 
                              required: watch('opciones.tipoIceBreaker') === 'adivina_quien_soy' 
                            })}
                          >
                            <option value="">Selecciona un tema</option>
                            {opcionesFormulario.tema?.map((tema: string) => (
                              <option key={tema} value={tema}>
                                {tema.charAt(0).toUpperCase() + tema.slice(1).replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Explicación para "tres_cosas_sobre_mi" */}
                      {watch('opciones.tipoIceBreaker') === 'tres_cosas_sobre_mi' && (
                        <div className="form-group">
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">
                              <strong>ℹ️ Información:</strong> Esta actividad se genera automáticamente con frases para completar como 
                              "Me gusta...", "No me gusta...", "Mi color favorito es...", etc. No requiere selección de tema.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="form-group">
                        <label htmlFor="numeroActividades" className="form-label">
                          Número de actividades
                        </label>
                        <select
                          id="numeroActividades"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.numeroActividades', { required: true })}
                        >
                          <option value="">Selecciona el número</option>
                          {opcionesFormulario.numeroActividades?.map((num: number) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'actividad' : 'actividades'}
                            </option>
                          ))}
                        </select>
                      </div>

                    </>
                  )}
                </>
              )}
              
              {/* Si estamos editando un recurso existente, mostrar campos editables para el contenido */}
              {!isCreating && isEditing && recurso && (
                <div className="form-group mt-4">
                  <label className="form-label">Contenido del recurso</label>
                  {/* Renderizado dinámico según tipo de recurso */}
                  {recurso.tipo === 'comprension' && (
                    <>
                      <label className="form-label">Texto principal</label>
                      <textarea
                        className="form-input mb-2"
                        rows={4}
                        value={editableContenido?.texto || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, texto: e.target.value })}
                      />
                      <label className="form-label">Preguntas</label>
                      {editableContenido?.preguntas?.map((item: any, idx: number) => (
                        <div key={idx} className="mb-2 p-2 border rounded">
                          <input
                            className="form-input mb-1"
                            value={item.pregunta}
                            onChange={e => {
                              const preguntas = [...editableContenido.preguntas];
                              preguntas[idx].pregunta = e.target.value;
                              setEditableContenido({ ...editableContenido, preguntas });
                            }}
                          />
                          <textarea
                            className="form-input"
                            rows={2}
                            value={item.respuesta}
                            onChange={e => {
                              const preguntas = [...editableContenido.preguntas];
                              preguntas[idx].respuesta = e.target.value;
                              setEditableContenido({ ...editableContenido, preguntas });
                            }}
                          />
                        </div>
                      ))}
                    </>
                  )}
                  {recurso.tipo === 'escritura' && (
                    <>
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-input mb-2"
                        rows={3}
                        value={editableContenido?.descripcion || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, descripcion: e.target.value })}
                      />
                      <label className="form-label">Instrucciones</label>
                      <textarea
                        className="form-input mb-2"
                        rows={2}
                        value={editableContenido?.instrucciones || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, instrucciones: e.target.value })}
                      />
                      <label className="form-label">Estructura Propuesta</label>
                      <textarea
                        className="form-input mb-2"
                        rows={2}
                        value={editableContenido?.estructuraPropuesta || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, estructuraPropuesta: e.target.value })}
                      />
                      <label className="form-label">Lista de verificación (un ítem por línea)</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={editableContenido?.listaVerificacion?.join('\n') || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, listaVerificacion: e.target.value.split('\n') })}
                      />
                    </>
                  )}
                  {recurso.tipo === 'gramatica' && (
                    <>
                      <label className="form-label">Instrucciones</label>
                      <textarea
                        className="form-input mb-2"
                        rows={2}
                        value={editableContenido?.instrucciones || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, instrucciones: e.target.value })}
                      />
                      <label className="form-label">Ejemplo</label>
                      <textarea
                        className="form-input mb-2"
                        rows={2}
                        value={editableContenido?.ejemplo || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, ejemplo: e.target.value })}
                      />
                      <label className="form-label">Ítems</label>
                      {editableContenido?.items?.map((item: any, idx: number) => (
                        <div key={idx} className="mb-2 p-2 border rounded">
                          <input
                            className="form-input mb-1"
                            value={item.consigna}
                            onChange={e => {
                              const items = [...editableContenido.items];
                              items[idx].consigna = e.target.value;
                              setEditableContenido({ ...editableContenido, items });
                            }}
                          />
                          <input
                            className="form-input"
                            value={item.respuesta}
                            onChange={e => {
                              const items = [...editableContenido.items];
                              items[idx].respuesta = e.target.value;
                              setEditableContenido({ ...editableContenido, items });
                            }}
                          />
                        </div>
                      ))}
                    </>
                  )}
                  {recurso.tipo === 'oral' && (
                    <>
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-input mb-2"
                        rows={2}
                        value={editableContenido?.descripcion || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, descripcion: e.target.value })}
                      />
                      <label className="form-label">Instrucciones para el docente</label>
                      <textarea
                        className="form-input mb-2"
                        rows={2}
                        value={editableContenido?.instruccionesDocente || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, instruccionesDocente: e.target.value })}
                      />
                      <label className="form-label">Guión para estudiantes</label>
                      <textarea
                        className="form-input mb-2"
                        rows={2}
                        value={editableContenido?.guionEstudiante || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, guionEstudiante: e.target.value })}
                      />
                      <label className="form-label">Preguntas orientadoras (un ítem por línea)</label>
                      <textarea
                        className="form-input mb-2"
                        rows={2}
                        value={editableContenido?.preguntasOrientadoras?.join('\n') || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, preguntasOrientadoras: e.target.value.split('\n') })}
                      />
                      <label className="form-label">Criterios de evaluación (un ítem por línea)</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={editableContenido?.criteriosEvaluacion?.join('\n') || ''}
                        onChange={e => setEditableContenido({ ...editableContenido, criteriosEvaluacion: e.target.value.split('\n') })}
                      />
                    </>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {isCreating ? (
                  <button
                    type="submit"
                    disabled={generando}
                    className="btn btn-primary"
                  >
                    {generando ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando recurso...
                      </span>
                    ) : (
                      'Generar recurso'
                    )}
                  </button>
                ) : (
                  <>
                    {isEditing ? (
                      <button
                        type="submit"
                        className="btn btn-success"
                      >
                        <Save size={16} className="mr-2" />
                        Guardar cambios
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary"
                      >
                        <Edit size={16} className="mr-2" />
                        Editar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="btn btn-secondary"
                    >
                      <Download size={16} className="mr-2" />
                      Descargar PDF
                    </button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </div>
        
        {/* Vista previa */}
        <div>
          {recurso ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Vista previa</h2>
              <ResourcePreview
                tipo={recurso.tipo}
                contenido={recurso.contenido}
              />
            </motion.div>
          ) : (
            <div className="bg-gray-50 rounded-lg border p-6 flex items-center justify-center h-96">
              <p className="text-gray-500 text-center">
                {isCreating
                  ? 'Completa el formulario y genera el recurso para ver la vista previa'
                  : 'Cargando recurso...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecursoForm;