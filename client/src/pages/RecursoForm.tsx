import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import { TIPOS_RECURSOS, OPCIONES_FORMULARIO, API_URL, OpcionesFormulario } from '../config';
import ResourcePreview from '../components/ResourcePreview';
import { formatTipoRecurso } from '../utils/formatters';
import { Edit, Save, Download, ArrowLeft, Check, X, FileText, List, MessageCircle, Type, HelpCircle, Trash2, Plus } from 'lucide-react';

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

  // Vigilar campos para validación en tiempo real
  const watchedTitulo = watch('titulo', '');
  const watchedTema = watch('opciones.tema', '') as string;
  const watchedTemaPersonalizado = watch('opciones.temaPersonalizado', '') as string;
  const watchedContexto = watch('opciones.contexto', '') as string;

  // Función de validación robusta para temas
  const validateTema = (value: string) => {
    if (!value || value.trim().length === 0) return false;

    const trimmed = value.trim();

    // No puede ser muy corto
    if (trimmed.length < 3) return false;

    // No puede ser muy largo  
    if (trimmed.length > 100) return false;

    // Debe contener solo letras, espacios, acentos, ñ, comas y puntos
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,\.]+$/.test(trimmed)) return false;

    // No puede ser solo espacios, puntos o comas
    if (/^[\s,\.]+$/.test(trimmed)) return false;

    // No puede empezar o terminar con espacios, comas o puntos
    if (/^[\s,\.]|[\s,\.]$/.test(trimmed)) return false;

    // No puede tener espacios, comas o puntos consecutivos
    if (/\s{2,}|,{2,}|\.{2,}/.test(trimmed)) return false;

    // No puede tener 3 letras iguales seguidas
    if (/(.)\1{2,}/i.test(trimmed.replace(/[\s,\.]/g, ''))) return false;

    // Lista ampliada de palabras sin sentido y combinaciones de teclas aleatorias
    const meaninglessWords = [
      'nada', 'na', 'x', 'xx', 'xxx', 'xxxx', 'asdf', 'qwerty', 'hjkl', 'zxcv', 'bnm',
      'aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg', 'hhh', 'iii', 'jjj', 'kkk',
      'lll', 'mmm', 'nnn', 'ooo', 'ppp', 'qqq', 'rrr', 'sss', 'ttt', 'uuu', 'vvv',
      'www', 'yyy', 'zzz', 'abc', 'abcd', 'abcde', 'qwe', 'wer', 'ert', 'rty', 'tyu',
      'yui', 'uio', 'iop', 'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl', 'zxc',
      'xcv', 'cvb', 'vbn', 'bnm', 'nm', 'wsdhgarergnhdrfgh', 'ksjdhfksjhf', 'alksjdlaskjd',
      'aaaa', 'bbbb', 'cccc', 'dddd', 'eeee', 'ffff', 'ggggg', 'hhhh', 'iiii', 'jjjj',
      'prueba', 'test', 'testing', 'ejemplo', 'ej', 'ejm', 'temp', 'temporal', 'tmp',
      'agsdsre', 'dfghjk', 'poiuyt', 'lkjhgf', 'mnbvcx', 'qazwsx', 'edcrfv', 'tgbyhn',
      'ujmik', 'olp', 'rewq', 'trewq', 'yuiop', 'ghjkl', 'vbnm', 'cxz', 'rtyuio'
    ];

    // Verificar palabras sin sentido
    const words = trimmed.toLowerCase().split(/[\s,\.]+/).filter(word => word.length > 0);
    for (const word of words) {
      if (meaninglessWords.includes(word)) return false;
    }

    // Verificar patrones de teclado aleatorio mejorado
    const cleanText = trimmed.toLowerCase().replace(/[\s,\.]/g, '');

    // Patrones de teclado QWERTY comunes
    const keyboardPatterns = [
      'qwerty', 'asdfgh', 'zxcvbn', 'qwertyui', 'asdfghjk', 'zxcvbnm',
      'qazwsx', 'edcrfv', 'tgbyhn', 'ujmik', 'olp', 'poiuyt', 'lkjhgf'
    ];

    for (const pattern of keyboardPatterns) {
      if (cleanText.includes(pattern) || cleanText.includes(pattern.split('').reverse().join(''))) {
        return false;
      }
    }

    // Verificar más de 4 consonantes seguidas sin vocales
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(cleanText)) return false;

    // Verificar que tenga al menos una vocal en cada palabra significativa
    for (const word of words) {
      if (word.length >= 3 && !/[aeiouáéíóúü]/i.test(word)) return false;
    }

    // Verificar que no sea solo una secuencia alfabética
    if (/^[a-z]{4,}$/.test(cleanText) && cleanText.split('').every((char, i, arr) =>
      i === 0 || char.charCodeAt(0) - arr[i - 1].charCodeAt(0) === 1)) return false;

    return true;
  };

  // Validaciones en tiempo real para campos de tema
  const temaValidations = {
    isValid: validateTema(watchedTema),
    hasMinLength: watchedTema.trim().length >= 3,
    hasMaxLength: watchedTema.trim().length <= 100,
    onlyValidChars: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,\.]*$/.test(watchedTema),
    noRepeatedChars: !(/(.)\1{2,}/i.test(watchedTema.replace(/[\s,\.]/g, ''))),
    noKeyboardPatterns: (() => {
      const cleanText = watchedTema.toLowerCase().replace(/[\s,\.]/g, '');
      const patterns = ['qwerty', 'asdfgh', 'zxcvbn', 'agsdsre', 'dfghjk'];
      return !patterns.some(pattern => cleanText.includes(pattern) || cleanText.includes(pattern.split('').reverse().join('')));
    })(),
    notEmpty: watchedTema.trim().length > 0
  };

  const temaPersonalizadoValidations = {
    isValid: validateTema(watchedTemaPersonalizado),
    hasMinLength: watchedTemaPersonalizado.trim().length >= 3,
    hasMaxLength: watchedTemaPersonalizado.trim().length <= 100,
    onlyValidChars: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,\.]*$/.test(watchedTemaPersonalizado),
    noRepeatedChars: !(/(.)\1{2,}/i.test(watchedTemaPersonalizado.replace(/[\s,\.]/g, ''))),
    noKeyboardPatterns: (() => {
      const cleanText = watchedTemaPersonalizado.toLowerCase().replace(/[\s,\.]/g, '');
      const patterns = ['qwerty', 'asdfgh', 'zxcvbn', 'agsdsre', 'dfghjk'];
      return !patterns.some(pattern => cleanText.includes(pattern) || cleanText.includes(pattern.split('').reverse().join('')));
    })(),
    notEmpty: watchedTemaPersonalizado.trim().length > 0
  };

  const contextoValidations = {
    isValid: validateTema(watchedContexto),
    hasMinLength: watchedContexto.trim().length >= 3,
    hasMaxLength: watchedContexto.trim().length <= 100,
    onlyValidChars: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,\.]*$/.test(watchedContexto),
    noRepeatedChars: !(/(.)\1{2,}/i.test(watchedContexto.replace(/[\s,\.]/g, ''))),
    noKeyboardPatterns: (() => {
      const cleanText = watchedContexto.toLowerCase().replace(/[\s,\.]/g, '');
      const patterns = ['qwerty', 'asdfgh', 'zxcvbn', 'agsdsre', 'dfghjk'];
      return !patterns.some(pattern => cleanText.includes(pattern) || cleanText.includes(pattern.split('').reverse().join('')));
    })(),
    notEmpty: watchedContexto.trim().length > 0
  };

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
    <div className="pb-6">
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
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 md:p-8"
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
                          className={`form-input ${errors.opciones?.tema ? 'border-red-500' : watchedTema && temaValidations.isValid ? 'border-green-500' : watchedTema && !temaValidations.isValid ? 'border-red-500' : ''}`} placeholder="Ej: Animales, amistad, la escuela"
                          disabled={generando}
                          {...register('opciones.tema', {
                            required: 'El tema es requerido',
                            validate: (value) => validateTema(value as string) || 'El tema no es válido. Debe ser educativo, sin símbolos ni combinaciones sin sentido'
                          })}
                        />
                        {errors.opciones?.tema && (
                          <p className="mt-1 text-sm text-red-600">{errors.opciones.tema.message}</p>
                        )}

                        {/* Tip cuando el campo está vacío */}
                        {!watchedTema && (
                          <div className="mt-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-xs">💡</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-indigo-900 font-semibold mb-1">Consejo para mejores resultados</p>
                              <p className="text-sm text-indigo-700 leading-relaxed">
                                Entre más detalles específicos incluyas, mejor será el contenido generado.
                                <span className="block mt-1 text-indigo-600 italic">Ejemplos: "Los ecosistemas acuáticos de América", "La historia de mi comunidad"</span>
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Validaciones visuales del tema */}
                        {watchedTema && (
                          <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                              Requisitos del tema
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className={`flex items-center text-xs px-2 py-1 rounded-md transition-colors ${temaValidations.notEmpty ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {temaValidations.notEmpty ? <Check size={14} className="mr-2 text-emerald-500" /> : <div className="w-3.5 h-3.5 mr-2 rounded-full border border-slate-300"></div>}
                                No debe estar vacío
                              </div>

                              <div className={`flex items-center text-xs px-2 py-1 rounded-md transition-colors ${temaValidations.hasMinLength && temaValidations.hasMaxLength ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {temaValidations.hasMinLength && temaValidations.hasMaxLength ? <Check size={14} className="mr-2 text-emerald-500" /> : <div className="w-3.5 h-3.5 mr-2 rounded-full border border-slate-300"></div>}
                                3-100 caracteres
                              </div>

                              <div className={`flex items-center text-xs px-2 py-1 rounded-md transition-colors ${temaValidations.onlyValidChars ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {temaValidations.onlyValidChars ? <Check size={14} className="mr-2 text-emerald-500" /> : <div className="w-3.5 h-3.5 mr-2 rounded-full border border-slate-300"></div>}
                                Sin símbolos especiales
                              </div>

                              <div className={`flex items-center text-xs px-2 py-1 rounded-md transition-colors ${temaValidations.isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {temaValidations.isValid ? <Check size={14} className="mr-2 text-emerald-500" /> : <div className="w-3.5 h-3.5 mr-2 rounded-full border border-slate-300"></div>}
                                Formato válido
                              </div>
                            </div>
                          </div>
                        )}
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
                          className={`form-input ${errors.opciones?.tema ? 'border-red-500' : watchedTema && temaValidations.isValid ? 'border-green-500' : watchedTema && !temaValidations.isValid ? 'border-red-500' : ''}`} placeholder="Ej: Mi mascota favorita, un día en el parque"
                          disabled={generando}
                          {...register('opciones.tema', {
                            required: 'El tema es requerido',
                            validate: (value) => validateTema(value as string) || 'El tema no es válido. Debe ser educativo, sin símbolos ni combinaciones sin sentido'
                          })}
                        />
                        {errors.opciones?.tema && (
                          <p className="mt-1 text-sm text-red-600">{errors.opciones.tema.message}</p>
                        )}

                        {/* Tip cuando el campo está vacío */}
                        {!watchedTema && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <svg className="h-4 w-4 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-2">
                                <p className="text-sm text-blue-700 font-medium">💡 Consejo:</p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Entre más detalles específicos incluyas, mejor será el contenido generado.
                                  Ejemplos: "Una aventura en el bosque tropical", "Mi primer día en una escuela nueva"
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Validaciones visuales del tema */}
                        {watchedTema && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Requisitos del tema:
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center text-xs">
                                {temaValidations.notEmpty ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={temaValidations.notEmpty ? 'text-green-600' : 'text-red-600'}>
                                  No debe estar vacío
                                </span>
                              </div>

                              <div className="flex items-center text-xs">
                                {temaValidations.hasMinLength && temaValidations.hasMaxLength ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={temaValidations.hasMinLength && temaValidations.hasMaxLength ? 'text-green-600' : 'text-red-600'}>
                                  Entre 3 y 100 caracteres
                                </span>
                              </div>

                              <div className="flex items-center text-xs">
                                {temaValidations.onlyValidChars ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={temaValidations.onlyValidChars ? 'text-green-600' : 'text-red-600'}>
                                  Sin símbolos
                                </span>
                              </div>
                            </div>

                            {/* Indicador general de validez */}
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex items-center text-xs">
                                {temaValidations.isValid ? (
                                  <>
                                    <Check className="h-3 w-3 text-green-500 mr-2" />
                                    <span className="text-green-600 font-medium">
                                      ¡Tema válido!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3 text-red-500 mr-2" />
                                    <span className="text-red-600 font-medium">
                                      Completa todos los requisitos
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
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
                          className={`form-input ${errors.opciones?.contexto ? 'border-red-500' : watchedContexto && contextoValidations.isValid ? 'border-green-500' : watchedContexto && !contextoValidations.isValid ? 'border-red-500' : ''}`}
                          placeholder="Ej: Animales, juegos, familia"
                          disabled={generando}
                          {...register('opciones.contexto', {
                            required: 'El contexto es requerido',
                            validate: (value) => validateTema(value as string) || 'El contexto no es válido. Debe ser educativo, sin símbolos ni combinaciones sin sentido'
                          })}
                        />
                        {errors.opciones?.contexto && (
                          <p className="mt-1 text-sm text-red-600">{errors.opciones.contexto.message}</p>
                        )}

                        {/* Validaciones visuales del contexto */}
                        {watchedContexto && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Requisitos del contexto:
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center text-xs">
                                {contextoValidations.notEmpty ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={contextoValidations.notEmpty ? 'text-green-600' : 'text-red-600'}>
                                  No debe estar vacío
                                </span>
                              </div>

                              <div className="flex items-center text-xs">
                                {contextoValidations.hasMinLength && contextoValidations.hasMaxLength ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={contextoValidations.hasMinLength && contextoValidations.hasMaxLength ? 'text-green-600' : 'text-red-600'}>
                                  Entre 3 y 100 caracteres
                                </span>
                              </div>

                              <div className="flex items-center text-xs">
                                {contextoValidations.onlyValidChars ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={contextoValidations.onlyValidChars ? 'text-green-600' : 'text-red-600'}>
                                  Sin símbolos
                                </span>
                              </div>

                              <div className="flex items-center text-xs">
                                {contextoValidations.noRepeatedChars ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={contextoValidations.noRepeatedChars ? 'text-green-600' : 'text-red-600'}>
                                  Sin letras repetidas 3 veces seguidas
                                </span>
                              </div>

                              <div className="flex items-center text-xs">
                                {contextoValidations.noKeyboardPatterns ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={contextoValidations.noKeyboardPatterns ? 'text-green-600' : 'text-red-600'}>
                                  Sin combinaciones aleatorias de teclado
                                </span>
                              </div>
                            </div>

                            {/* Indicador general de validez */}
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex items-center text-xs">
                                {contextoValidations.isValid ? (
                                  <>
                                    <Check className="h-3 w-3 text-green-500 mr-2" />
                                    <span className="text-green-600 font-medium">
                                      ¡Contexto válido!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3 text-red-500 mr-2" />
                                    <span className="text-red-600 font-medium">
                                      Completa todos los requisitos
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
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
                          className={`form-input ${errors.opciones?.tema ? 'border-red-500' : watchedTema && temaValidations.isValid ? 'border-green-500' : watchedTema && !temaValidations.isValid ? 'border-red-500' : ''}`} placeholder="Ej: Mi familia, mis juguetes favoritos"
                          disabled={generando}
                          {...register('opciones.tema', {
                            required: 'El tema es requerido',
                            validate: (value) => validateTema(value as string) || 'El tema no es válido. Debe ser educativo, sin símbolos ni combinaciones sin sentido'
                          })}
                        />
                        {errors.opciones?.tema && (
                          <p className="mt-1 text-sm text-red-600">{errors.opciones.tema.message}</p>
                        )}

                        {/* Tip cuando el campo está vacío */}
                        {!watchedTema && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <svg className="h-4 w-4 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-2">
                                <p className="text-sm text-blue-700 font-medium">💡 Consejo:</p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Entre más detalles específicos incluyas, mejor será el contenido generado.
                                  Ejemplos: "La familia extendida y sus tradiciones", "Los juguetes tradicionales de mi país"
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Validaciones visuales del tema */}
                        {watchedTema && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Requisitos del tema:
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center text-xs">
                                {temaValidations.notEmpty ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={temaValidations.notEmpty ? 'text-green-600' : 'text-red-600'}>
                                  No debe estar vacío
                                </span>
                              </div>

                              <div className="flex items-center text-xs">
                                {temaValidations.hasMinLength && temaValidations.hasMaxLength ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={temaValidations.hasMinLength && temaValidations.hasMaxLength ? 'text-green-600' : 'text-red-600'}>
                                  Entre 3 y 100 caracteres
                                </span>
                              </div>

                              <div className="flex items-center text-xs">
                                {temaValidations.onlyValidChars ? (
                                  <Check className="h-3 w-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500 mr-2" />
                                )}
                                <span className={temaValidations.onlyValidChars ? 'text-green-600' : 'text-red-600'}>
                                  Sin símbolos
                                </span>
                              </div>
                            </div>

                            {/* Indicador general de validez */}
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex items-center text-xs">
                                {temaValidations.isValid ? (
                                  <>
                                    <Check className="h-3 w-3 text-green-500 mr-2" />
                                    <span className="text-green-600 font-medium">
                                      ¡Tema válido!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3 text-red-500 mr-2" />
                                    <span className="text-red-600 font-medium">
                                      Completa todos los requisitos
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
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
                          <>
                            <input
                              id="temaPersonalizado"
                              type="text"
                              className={`form-input mt-2 ${errors.opciones?.temaPersonalizado ? 'border-red-500' : watchedTemaPersonalizado && temaPersonalizadoValidations.isValid ? 'border-green-500' : watchedTemaPersonalizado && !temaPersonalizadoValidations.isValid ? 'border-red-500' : ''}`}
                              placeholder="Escribe tu tema personalizado (ej: Los medios de transporte, La naturaleza)"
                              disabled={generando}
                              {...register('opciones.temaPersonalizado', {
                                required: watch('opciones.temaPredefinido') === 'Otro (personalizado)' ? 'El tema personalizado es requerido' : false,
                                validate: (value) => {
                                  if (watch('opciones.temaPredefinido') === 'Otro (personalizado)') {
                                    return validateTema(value as string) || 'El tema no es válido. Debe ser educativo, sin símbolos ni combinaciones sin sentido';
                                  }
                                  return true;
                                }
                              })} />
                            {errors.opciones?.temaPersonalizado && (
                              <p className="mt-1 text-sm text-red-600">{errors.opciones.temaPersonalizado.message}</p>
                            )}

                            {/* Tip cuando el campo está vacío */}
                            {!watchedTemaPersonalizado && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0">
                                    <svg className="h-4 w-4 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="ml-2">
                                    <p className="text-sm text-blue-700 font-medium">💡 Consejo:</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                      Entre más detalles específicos incluyas, mejor será el contenido generado.
                                      Ejemplos: "Los instrumentos musicales de viento", "Las profesiones que ayudan a mi comunidad"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Validaciones visuales del tema personalizado */}
                            {watchedTemaPersonalizado && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Requisitos del tema personalizado:
                                </p>
                                <div className="space-y-1">
                                  <div className="flex items-center text-xs">
                                    {temaPersonalizadoValidations.notEmpty ? (
                                      <Check className="h-3 w-3 text-green-500 mr-2" />
                                    ) : (
                                      <X className="h-3 w-3 text-red-500 mr-2" />
                                    )}
                                    <span className={temaPersonalizadoValidations.notEmpty ? 'text-green-600' : 'text-red-600'}>
                                      No debe estar vacío
                                    </span>
                                  </div>

                                  <div className="flex items-center text-xs">
                                    {temaPersonalizadoValidations.hasMinLength && temaPersonalizadoValidations.hasMaxLength ? (
                                      <Check className="h-3 w-3 text-green-500 mr-2" />
                                    ) : (
                                      <X className="h-3 w-3 text-red-500 mr-2" />
                                    )}
                                    <span className={temaPersonalizadoValidations.hasMinLength && temaPersonalizadoValidations.hasMaxLength ? 'text-green-600' : 'text-red-600'}>
                                      Entre 3 y 100 caracteres
                                    </span>
                                  </div>

                                  <div className="flex items-center text-xs">
                                    {temaPersonalizadoValidations.onlyValidChars ? (
                                      <Check className="h-3 w-3 text-green-500 mr-2" />
                                    ) : (
                                      <X className="h-3 w-3 text-red-500 mr-2" />
                                    )}
                                    <span className={temaPersonalizadoValidations.onlyValidChars ? 'text-green-600' : 'text-red-600'}>
                                      Sin símbolos
                                    </span>
                                  </div>

                                  <div className="flex items-center text-xs">
                                    {temaPersonalizadoValidations.noRepeatedChars ? (
                                      <Check className="h-3 w-3 text-green-500 mr-2" />
                                    ) : (
                                      <X className="h-3 w-3 text-red-500 mr-2" />
                                    )}
                                    <span className={temaPersonalizadoValidations.noRepeatedChars ? 'text-green-600' : 'text-red-600'}>
                                      Sin letras repetidas 3 veces seguidas
                                    </span>
                                  </div>

                                  <div className="flex items-center text-xs">
                                    {temaPersonalizadoValidations.noKeyboardPatterns ? (
                                      <Check className="h-3 w-3 text-green-500 mr-2" />
                                    ) : (
                                      <X className="h-3 w-3 text-red-500 mr-2" />
                                    )}
                                    <span className={temaPersonalizadoValidations.noKeyboardPatterns ? 'text-green-600' : 'text-red-600'}>
                                      Sin combinaciones aleatorias de teclado
                                    </span>
                                  </div>
                                </div>

                                {/* Indicador general de validez */}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <div className="flex items-center text-xs">
                                    {temaPersonalizadoValidations.isValid ? (
                                      <>
                                        <Check className="h-3 w-3 text-green-500 mr-2" />
                                        <span className="text-green-600 font-medium">
                                          ¡Tema válido!
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-3 w-3 text-red-500 mr-2" />
                                        <span className="text-red-600 font-medium">
                                          Completa todos los requisitos
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
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
                <div className="mt-8 space-y-6">
                  <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-800 pb-2">
                    <Edit size={20} />
                    <h3 className="text-lg font-semibold">Editar Contenido</h3>
                  </div>

                  {/* Renderizado dinámico según tipo de recurso */}
                  {recurso.tipo === 'comprension' && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          <FileText size={16} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                          Texto principal
                        </label>
                        <textarea
                          className="form-input min-h-[200px] font-medium text-slate-600 dark:text-slate-200"
                          value={editableContenido?.texto || ''}
                          onChange={e => setEditableContenido({ ...editableContenido, texto: e.target.value })}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <HelpCircle size={16} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                            Preguntas y Respuestas
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const preguntas = [...(editableContenido.preguntas || [])];
                              preguntas.push({ pregunta: '', respuesta: '' });
                              setEditableContenido({ ...editableContenido, preguntas });
                            }}
                            className="btn btn-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-indigo-200 dark:border-indigo-700"
                          >
                            <Plus size={16} className="mr-1" />
                            Agregar Pregunta
                          </button>
                        </div>
                        <div className="grid gap-4">
                          {editableContenido?.preguntas?.map((item: any, idx: number) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative group">
                              <button
                                type="button"
                                onClick={() => {
                                  const preguntas = [...editableContenido.preguntas];
                                  preguntas.splice(idx, 1);
                                  setEditableContenido({ ...editableContenido, preguntas });
                                }}
                                className="absolute top-2 right-2 p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar pregunta"
                              >
                                <Trash2 size={16} />
                              </button>
                              <div className="mb-3 pr-8">
                                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Pregunta {idx + 1}</label>
                                <input
                                  className="form-input font-medium"
                                  value={item.pregunta}
                                  onChange={e => {
                                    const preguntas = [...editableContenido.preguntas];
                                    preguntas[idx].pregunta = e.target.value;
                                    setEditableContenido({ ...editableContenido, preguntas });
                                  }}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Respuesta Esperada</label>
                                <textarea
                                  className="form-input text-sm"
                                  rows={2}
                                  value={item.respuesta}
                                  onChange={e => {
                                    const preguntas = [...editableContenido.preguntas];
                                    preguntas[idx].respuesta = e.target.value;
                                    setEditableContenido({ ...editableContenido, preguntas });
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {recurso.tipo === 'escritura' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                          <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            <FileText size={16} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                            Descripción
                          </label>
                          <textarea
                            className="form-input"
                            rows={4}
                            value={editableContenido?.descripcion || ''}
                            onChange={e => setEditableContenido({ ...editableContenido, descripcion: e.target.value })}
                          />
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                          <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            <List size={16} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                            Instrucciones
                          </label>
                          <textarea
                            className="form-input"
                            rows={4}
                            value={editableContenido?.instrucciones || ''}
                            onChange={e => setEditableContenido({ ...editableContenido, instrucciones: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          <Type size={16} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                          Estructura Propuesta
                        </label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={editableContenido?.estructuraPropuesta || ''}
                          onChange={e => setEditableContenido({ ...editableContenido, estructuraPropuesta: e.target.value })}
                        />
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          <Check size={16} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                          Lista de verificación (un ítem por línea)
                        </label>
                        <textarea
                          className="form-input font-mono text-sm"
                          rows={5}
                          value={editableContenido?.listaVerificacion?.join('\n') || ''}
                          onChange={e => setEditableContenido({ ...editableContenido, listaVerificacion: e.target.value.split('\n') })}
                        />
                      </div>
                    </div>
                  )}

                  {recurso.tipo === 'gramatica' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                            <List size={16} className="mr-2 text-indigo-500" />
                            Instrucciones
                          </label>
                          <textarea
                            className="form-input"
                            rows={3}
                            value={editableContenido?.instrucciones || ''}
                            onChange={e => setEditableContenido({ ...editableContenido, instrucciones: e.target.value })}
                          />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                            <HelpCircle size={16} className="mr-2 text-indigo-500" />
                            Ejemplo
                          </label>
                          <textarea
                            className="form-input"
                            rows={3}
                            value={editableContenido?.ejemplo || ''}
                            onChange={e => setEditableContenido({ ...editableContenido, ejemplo: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="flex items-center text-sm font-semibold text-slate-700">
                            <List size={16} className="mr-2 text-indigo-500" />
                            Ejercicios
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const items = [...(editableContenido.items || [])];
                              items.push({ consigna: '', respuesta: '' });
                              setEditableContenido({ ...editableContenido, items });
                            }}
                            className="btn btn-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                          >
                            <Plus size={16} className="mr-1" />
                            Agregar Ejercicio
                          </button>
                        </div>
                        <div className="space-y-3">
                          {editableContenido?.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors group relative">
                              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold mt-2">
                                {idx + 1}
                              </span>
                              <div className="flex-grow grid md:grid-cols-2 gap-3 pr-8">
                                <div>
                                  <label className="text-xs text-slate-500 mb-1 block">Consigna</label>
                                  <input
                                    className="form-input text-sm"
                                    value={item.consigna}
                                    onChange={e => {
                                      const items = [...editableContenido.items];
                                      items[idx].consigna = e.target.value;
                                      setEditableContenido({ ...editableContenido, items });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-500 mb-1 block">Respuesta</label>
                                  <input
                                    className="form-input text-sm"
                                    value={item.respuesta}
                                    onChange={e => {
                                      const items = [...editableContenido.items];
                                      items[idx].respuesta = e.target.value;
                                      setEditableContenido({ ...editableContenido, items });
                                    }}
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const items = [...editableContenido.items];
                                  items.splice(idx, 1);
                                  setEditableContenido({ ...editableContenido, items });
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar ejercicio"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {recurso.tipo === 'oral' && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                          <FileText size={16} className="mr-2 text-indigo-500" />
                          Descripción General
                        </label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={editableContenido?.descripcion || ''}
                          onChange={e => setEditableContenido({ ...editableContenido, descripcion: e.target.value })}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                            <MessageCircle size={16} className="mr-2 text-indigo-500" />
                            Instrucciones para el Docente
                          </label>
                          <textarea
                            className="form-input"
                            rows={4}
                            value={editableContenido?.instruccionesDocente || ''}
                            onChange={e => setEditableContenido({ ...editableContenido, instruccionesDocente: e.target.value })}
                          />
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                            <MessageCircle size={16} className="mr-2 text-emerald-500" />
                            Guión para Estudiantes
                          </label>
                          <textarea
                            className="form-input"
                            rows={4}
                            value={editableContenido?.guionEstudiante || ''}
                            onChange={e => setEditableContenido({ ...editableContenido, guionEstudiante: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                            <HelpCircle size={16} className="mr-2 text-indigo-500" />
                            Preguntas Orientadoras
                            <span className="ml-2 text-xs font-normal text-slate-400">(un ítem por línea)</span>
                          </label>
                          <textarea
                            className="form-input font-mono text-sm"
                            rows={4}
                            value={editableContenido?.preguntasOrientadoras?.join('\n') || ''}
                            onChange={e => setEditableContenido({ ...editableContenido, preguntasOrientadoras: e.target.value.split('\n') })}
                          />
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                            <Check size={16} className="mr-2 text-indigo-500" />
                            Criterios de Evaluación
                            <span className="ml-2 text-xs font-normal text-slate-400">(un ítem por línea)</span>
                          </label>
                          <textarea
                            className="form-input font-mono text-sm"
                            rows={4}
                            value={editableContenido?.criteriosEvaluacion?.join('\n') || ''}
                            onChange={e => setEditableContenido({ ...editableContenido, criteriosEvaluacion: e.target.value.split('\n') })}
                          />
                        </div>
                      </div>
                    </div>
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
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 flex items-center justify-center h-96">
              <p className="text-gray-500 dark:text-slate-400 text-center">
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

