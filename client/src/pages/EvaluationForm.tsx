import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Check, X, AlertCircle, Lightbulb, FileText } from 'lucide-react';
import { API_URL } from '../config';

const EvaluationForm: React.FC = () => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [longitud, setLongitud] = useState('100');
  const [numLiteral, setNumLiteral] = useState(5);
  const [loading, setLoading] = useState(false);

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
    isValid: validateTema(tema),
    hasMinLength: tema.trim().length >= 3,
    hasMaxLength: tema.trim().length <= 100,
    onlyValidChars: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,\.]*$/.test(tema),
    noRepeatedChars: !(/(.)\1{2,}/i.test(tema.replace(/[\s,\.]/g, ''))),
    noKeyboardPatterns: (() => {
      const cleanText = tema.toLowerCase().replace(/[\s,\.]/g, '');
      const patterns = ['qwerty', 'asdfgh', 'zxcvbn', 'agsdsre', 'dfghjk'];
      return !patterns.some(pattern => cleanText.includes(pattern) || cleanText.includes(pattern.split('').reverse().join('')));
    })(),
    notEmpty: tema.trim().length > 0
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validaciones antes de enviar
    if (!titulo.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (!temaValidations.isValid) {
      toast.error('El tema no es válido. Debe ser educativo, sin símbolos ni combinaciones sin sentido');
      return;
    }

    // Validación adicional
    if (numLiteral < 1 || numLiteral > 10) {
      toast.error('El número de preguntas debe estar entre 1 y 10');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/exams`, {
        titulo,
        tipoTexto: 'narrativo',
        tema,
        longitud,
        numLiteral
      });
      if (res.data.success) {
        toast.success('Examen creado');
        // Redirigir a detalle para mostrar link y contenido
        const slug = res.data.data.slug;
        navigate(`/evaluaciones/${slug}/detalle`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al crear examen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Crear Nuevo Examen</h1>
        <p className="text-slate-600">Completa los detalles para generar tu evaluación automáticamente.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">Título del Examen</label>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="form-input"
              placeholder="Ej: Examen de comprensión lectora - Los animales"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tema Principal</label>
            <input
              value={tema}
              onChange={e => setTema(e.target.value)}
              className={`form-input ${tema && temaValidations.isValid ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500' : tema && !temaValidations.isValid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''}`}
              placeholder="Ej: Los animales de la selva, La amistad"
              required
            />

            {/* Tip cuando el campo está vacío */}
            {!tema && (
              <div className="mt-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Consejo para mejores resultados</p>
                  <p className="text-sm text-indigo-700 mt-1">
                    Entre más detalles específicos incluyas, mejor será el contenido generado.
                    Ejemplos: "Los animales marinos del océano Pacífico", "La amistad entre niños de diferentes culturas"
                  </p>
                </div>
              </div>
            )}

            {/* Validaciones visuales del tema */}
            {tema && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Verificando tema:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    {temaValidations.notEmpty ? (
                      <Check className="h-4 w-4 text-emerald-500 mr-2" />
                    ) : (
                      <X className="h-4 w-4 text-rose-500 mr-2" />
                    )}
                    <span className={temaValidations.notEmpty ? 'text-slate-700' : 'text-slate-500'}>
                      No debe estar vacío
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    {temaValidations.hasMinLength && temaValidations.hasMaxLength ? (
                      <Check className="h-4 w-4 text-emerald-500 mr-2" />
                    ) : (
                      <X className="h-4 w-4 text-rose-500 mr-2" />
                    )}
                    <span className={temaValidations.hasMinLength && temaValidations.hasMaxLength ? 'text-slate-700' : 'text-slate-500'}>
                      Entre 3 y 100 caracteres ({tema.trim().length}/100)
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    {temaValidations.onlyValidChars ? (
                      <Check className="h-4 w-4 text-emerald-500 mr-2" />
                    ) : (
                      <X className="h-4 w-4 text-rose-500 mr-2" />
                    )}
                    <span className={temaValidations.onlyValidChars ? 'text-slate-700' : 'text-slate-500'}>
                      Sin caracteres especiales
                    </span>
                  </div>
                </div>

                {/* Indicador general de validez */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  {temaValidations.isValid ? (
                    <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                      <Check className="h-4 w-4 mr-2" />
                      ¡Excelente! Tu tema está listo
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium text-rose-600 bg-rose-50 p-2 rounded-lg">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Completa los requisitos arriba
                      </div>
                      {tema.trim().length >= 3 && tema.trim().length <= 15 && (
                        <div className="flex items-start text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
                          <Lightbulb className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Tip:</strong> Agrega más detalles específicos para obtener contenido más rico y personalizado
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Longitud del Texto</label>
              <select value={longitud} onChange={e => setLongitud(e.target.value)} className="form-select">
                <option value="100">100 palabras</option>
                <option value="150">150 palabras</option>
                <option value="200">200 palabras</option>
                <option value="250">250 palabras</option>
                <option value="300">300 palabras</option>
                <option value="350">350 palabras</option>
                <option value="400">400 palabras</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Número de Preguntas</label>
              <input
                type="number"
                value={numLiteral}
                onChange={e => setNumLiteral(parseInt(e.target.value))}
                className="form-input"
                required
                min={1}
                max={10}
              />
              <p className="text-xs text-slate-500 mt-1">Máximo 10 preguntas</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary w-full md:w-auto flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></span>
                  Generando...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Generar Examen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm;
