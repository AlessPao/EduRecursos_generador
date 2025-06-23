import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Check, X } from 'lucide-react';
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
      i === 0 || char.charCodeAt(0) - arr[i-1].charCodeAt(0) === 1)) return false;
    
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
    <div className="pt-20 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Examen</h1>      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block form-label">Título</label>          <input 
            value={titulo} 
            onChange={e => setTitulo(e.target.value)} 
            className="form-input w-full"
            placeholder="Ej: Examen de comprensión lectora - Los animales"
            required 
          />
        </div>
        
        <div>
          <label className="block form-label">Tema</label>
          <input 
            value={tema} 
            onChange={e => setTema(e.target.value)} 
            className={`form-input w-full ${tema && temaValidations.isValid ? 'border-green-500' : tema && !temaValidations.isValid ? 'border-red-500' : ''}`}
            placeholder="Ej: Los animales de la selva, La amistad"
            required 
          />
            {/* Tip cuando el campo está vacío */}
          {!tema && (
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
                    Ejemplos: "Los animales marinos del océano Pacífico", "La amistad entre niños de diferentes culturas"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validaciones visuales del tema */}
          {tema && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Verificando tema:
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
                </div>                <div className="flex items-center text-xs">
                  {temaValidations.hasMinLength && temaValidations.hasMaxLength ? (
                    <Check className="h-3 w-3 text-green-500 mr-2" />
                  ) : (
                    <X className="h-3 w-3 text-red-500 mr-2" />
                  )}
                  <span className={temaValidations.hasMinLength && temaValidations.hasMaxLength ? 'text-green-600' : 'text-red-600'}>
                    Entre 3 y 100 caracteres ({tema.trim().length}/100)
                  </span>
                </div>
                
                <div className="flex items-center text-xs">
                  {temaValidations.onlyValidChars ? (
                    <Check className="h-3 w-3 text-green-500 mr-2" />
                  ) : (
                    <X className="h-3 w-3 text-red-500 mr-2" />
                  )}
                  <span className={temaValidations.onlyValidChars ? 'text-green-600' : 'text-red-600'}>
                    Sin caracteres especiales
                  </span>
                </div>
              </div>
              
              {/* Indicador general de validez */}
              <div className="mt-3 pt-2 border-t border-gray-200">
                {temaValidations.isValid ? (
                  <div className="flex items-center text-xs">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-green-600 font-medium">
                      ¡Excelente! Tu tema está listo
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center text-xs">
                      <X className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-orange-600 font-medium">
                        Completa los requisitos arriba
                      </span>
                    </div>
                    {tema.trim().length >= 3 && tema.trim().length <= 15 && (
                      <div className="flex items-start">
                        <svg className="h-3 w-3 text-amber-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-amber-600">
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
        <div>
          <label className="block">Longitud (palabras)</label>
          <select value={longitud} onChange={e => setLongitud(e.target.value)} className="form-select w-full">
            <option value="100">100 palabras</option>
            <option value="200">200 palabras</option>
            <option value="300">300 palabras</option>
          </select>
        </div>        <div>
          <label className="block">Número de preguntas literales</label>
          <input 
            type="number" 
            value={numLiteral} 
            onChange={e => setNumLiteral(parseInt(e.target.value))} 
            className="form-input w-full" 
            required 
            min={1} 
            max={10}
          />
          <p className="text-sm text-gray-500 mt-1">Máximo 10 preguntas</p>
        </div>
        <button
          type="submit"
          className="btn btn-primary flex items-center justify-center"
          disabled={loading}
        >
          {loading && <span className="animate-spin h-5 w-5 mr-2 border-2 border-white rounded-full border-t-transparent"></span>}
          {loading ? 'Generando...' : 'Generar examen'}
        </button>
      </form>
    </div>
  );
};

export default EvaluationForm;

