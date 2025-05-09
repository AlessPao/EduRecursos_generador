// API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Tipos de recursos
export const TIPOS_RECURSOS = [
  { 
    id: 'comprension', 
    nombre: 'Comprensión lectora', 
    descripcion: 'Fichas de lectura con preguntas de comprensión',
    icon: 'BookOpen'
  },
  { 
    id: 'escritura', 
    nombre: 'Producción escrita', 
    descripcion: 'Actividades para desarrollar habilidades de escritura',
    icon: 'PenTool'
  },
  { 
    id: 'gramatica', 
    nombre: 'Gramática y ortografía', 
    descripcion: 'Ejercicios de reforzamiento de aspectos formales',
    icon: 'SpellCheck'
  },
  { 
    id: 'oral', 
    nombre: 'Comunicación oral', 
    descripcion: 'Guiones y actividades para la expresión oral',
    icon: 'MessageCircle'
  }
];

// Opciones para los formularios según tipo
export const OPCIONES_FORMULARIO = {
  comprension: {
    tipoTexto: ['narrativo', 'descriptivo', 'informativo', 'instructivo'],
    longitud: ['corto (100-150 palabras)', 'medio (150-250 palabras)', 'largo (250-350 palabras)']
  },
  escritura: {
    tipoTexto: ['narrativo', 'descriptivo', 'informativo', 'instructivo'],
    nivelAyuda: ['bajo', 'medio', 'alto']
  },
  gramatica: {
    aspecto: ['mayúsculas', 'punto final', 'signos de interrogación', 'signos de exclamación', 'separación de palabras'],
    tipoEjercicio: ['completar', 'identificar', 'corregir', 'ordenar']
  },
  oral: {
    formato: ['diálogo', 'narración', 'exposición breve', 'dramatización']
  }
};