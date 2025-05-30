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
  },
  { 
    id: 'drag_and_drop', 
    nombre: 'Juegos interactivos', 
    descripcion: 'Actividades de arrastrar y soltar: formar o completar oraciones',
    icon: 'Puzzle' 
  }
];

// Tipos para las opciones del formulario
export interface OpcionesFormulario {
  comprension?: {
    tipoTexto: string[];
    longitud: string[];
  };
  escritura?: {
    tipoTexto: string[];
    nivelAyuda: string[];
  };
  gramatica?: {
    aspecto: string[];
    tipoEjercicio: string[];
  };
  oral?: {
    formato: string[];
  };
  drag_and_drop?: {
    numActividades: number[];
    tipoActividad: string[];
    temasPredefinidos: string[];
    longitudOracion: string[];
  };
  [key: string]: any;
}

// Opciones para los formularios según tipo
export const OPCIONES_FORMULARIO: OpcionesFormulario = {
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
  },
  drag_and_drop: {
    numActividades: [1, 2, 3, 4, 5],
    tipoActividad: ['formar_oracion', 'completar_oracion'],
    longitudOracion: ['Corta (3-4 palabras)', 'Normal (4-5 palabras)', 'Larga (5-6 palabras)'],
    temasPredefinidos: [
      'La familia',
      'La escuela', 
      'Los animales',
      'Las estaciones del año',
      'Los alimentos',
      'Los juguetes',
      'La ciudad',
      'El cuerpo humano',
      'Los deportes',
      'Las profesiones',
      'Otro (personalizado)'
    ]
  }
};