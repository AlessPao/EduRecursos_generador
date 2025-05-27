import axios from 'axios';
import { llm_base_url, offenrouter_api_key, llm_model } from '../config/index.js';

/**
 * Genera un recurso educativo utilizando LLM
 * @param {Object} params - Parámetros para generar el recurso
 * @returns {Promise<Object>} - Recurso generado
 */
export async function generarRecurso(params) {
  const prompt = crearPrompt(params);

  const payload = {
    model: llm_model,
    messages: [
      {
        role: 'system',
        content:
          'Eres un docente experto en comunicación para estudiantes de 2º grado que crea materiales didácticos alineados con el Currículo Nacional peruano.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    response_format: "json"
  };

  const headers = {
    'Authorization': `Bearer ${offenrouter_api_key}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(`${llm_base_url}/chat/completions`, payload, { headers });

    // Validar la estructura de la respuesta
    if (!response.data || !response.data.choices || !response.data.choices.length) {
      throw new Error('Respuesta inválida: estructura de datos inesperada.');
    }
    const content = response.data.choices[0].message.content;
    const recurso = parseJSON(content);
    return recurso;
  } catch (error) {
    console.error('Error al generar recurso con LLM:', error.response?.data || error.message);

    // Reintento
    try {
      console.log('Reintentando petición a LLM...');
      const retry = await axios.post(`${llm_base_url}/chat/completions`, payload, { headers });

      if (!retry.data || !retry.data.choices || !retry.data.choices.length) {
        throw new Error('Respuesta inválida en reintento: estructura de datos inesperada.');
      }
      const retryContent = retry.data.choices[0].message.content;
      const recurso = parseJSON(retryContent);
      return recurso;
    } catch (retryError) {
      console.error('Error en segundo intento:', retryError.response?.data || retryError.message);
      throw new Error('No se pudo generar el recurso. Por favor, intente de nuevo más tarde.');
    }
  }
}

/**
 * Crea el prompt adecuado según el tipo de recurso
 * @param {Object} params - Parámetros para el prompt
 * @returns {string} - Prompt generado
 */
function crearPrompt({ tipo, opciones }) {
  let prompt = '';

  // Agregar el título si se proporciona
  if (opciones.titulo) {
    prompt += `El título de este recurso es "${opciones.titulo}". Asegúrate de que el contenido generado se relacione directamente con este título.\n\n`;
  }

  // Agregar competencias (usando las que se provean o un resumen por defecto)
  if (opciones.competencias) {
    prompt += `Utiliza las siguientes competencias como guía: ${opciones.competencias}\n\n`;
  } else {
    prompt += `Utiliza las siguientes competencias como guía:
- **Lectura**: Interpretar, inferir y evaluar textos simples (con ilustraciones y vocabulario conocido).
- **Escritura**: Organizar y desarrollar ideas de forma coherente, usando vocabulario adecuado, conectores básicos y normas ortográficas.
- **Comunicación Oral**: Expresar ideas de forma clara y estructurada, utilizando recursos verbales y no verbales y conectores simples.\n\n`;
  }

  // Generación del prompt según el tipo de recurso
  switch (tipo) {
    case 'evaluacion':
      prompt += `Genera un examen de opción múltiple de comprensión lectora para estudiantes de 2º grado con las siguientes características:
- Título: ${opciones.titulo}
- Tipo de texto: ${opciones.tipoTexto}
- Tema: ${opciones.tema}
- Longitud: ${opciones.longitud} palabras
- Preguntas literales: ${opciones.numLiteral}

Cada pregunta debe tener 4 opciones, indicando cuál es la correcta. El texto y las preguntas deben ser apropiados para niños de 7-8 años.

Responde ÚNICAMENTE con un objeto JSON que siga esta estructura exacta, sin explicaciones, sin comentarios:

{
  "titulo": "Título del examen",
  "texto": "Contenido del texto completo",
  "preguntas": [
    { "pregunta": "Pregunta 1", "opciones": ["Opción A","Opción B","Opción C","Opción D"], "respuesta": "Opción A" },
    // ...preguntas pero solo tipo literal
  ]
}`;
      break;
    case 'comprension':
      prompt += `Genera una ficha de comprensión lectora para estudiantes de 2º grado con las siguientes características:
- Tipo de texto: ${opciones.tipoTexto}
- Tema: ${opciones.tema}
- Longitud: ${opciones.longitud} palabras
- Preguntas literales: ${opciones.numLiteral}
- Preguntas inferenciales: ${opciones.numInferencial}
- Preguntas críticas: ${opciones.numCritica}
${opciones.vocabulario ? '- Incluir sección de vocabulario con 5 palabras clave y sus definiciones' : ''}

El texto debe ser apropiado para niños de 7-8 años, con vocabulario sencillo y oraciones cortas.

Responde ÚNICAMENTE con un objeto JSON que siga esta estructura exacta, sin explicaciones, sin comentarios:

{
  "titulo": "Título de la ficha",
  "texto": "Contenido del texto completo",
  "preguntas": [
    {"tipo": "literal", "pregunta": "Pregunta 1", "respuesta": "Respuesta 1"},
    {"tipo": "inferencial", "pregunta": "Pregunta 2", "respuesta": "Respuesta 2"},
    {"tipo": "critica", "pregunta": "Pregunta 3", "respuesta": "Respuesta 3"}
  ],
  "vocabulario": [
    {"palabra": "Palabra 1", "definicion": "Definición 1"},
    {"palabra": "Palabra 2", "definicion": "Definición 2"}
  ]
}`;
      break;
    case 'escritura':
      prompt += `Genera una actividad de producción escrita para estudiantes de 2º grado con las siguientes características:
- Tipo de texto: ${opciones.tipoTexto}
- Tema: ${opciones.tema}
- Nivel de ayuda: ${opciones.nivelAyuda}
${opciones.conectores ? '- Incluir banco de conectores apropiados' : ''}

La actividad debe incluir instrucciones claras y sencillas apropiadas para niños de 7-8 años.

Responde ÚNICAMENTE con un objeto JSON que siga esta estructura exacta, sin explicaciones, sin comentarios:

{
  "titulo": "Título de la actividad",
  "descripcion": "Breve descripción de la actividad",
  "instrucciones": "Instrucciones paso a paso",
  "estructuraPropuesta": "Estructura sugerida para el texto",
  "conectores": ["Conector 1", "Conector 2", "Conector 3"],
  "listaVerificacion": ["Punto 1", "Punto 2", "Punto 3"]
}`;
      break;
    case 'gramatica':
      prompt += `Genera un ejercicio de gramática y ortografía para estudiantes de 2º grado con las siguientes características:
- Aspecto a trabajar: ${opciones.aspecto}
- Tipo de ejercicio: ${opciones.tipoEjercicio}
- Número de ítems: ${opciones.numItems}
- Contexto: ${opciones.contexto}

El ejercicio debe incluir instrucciones claras y ejemplos sencillos apropiados para niños de 7-8 años.

Responde ÚNICAMENTE con un objeto JSON que siga esta estructura exacta, sin explicaciones, sin comentarios:

{
  "titulo": "Título del ejercicio",
  "instrucciones": "Instrucciones claras y sencillas",
  "ejemplo": "Ejemplo resuelto para guiar a los estudiantes",
  "items": [
    {"consigna": "Ítem 1", "respuesta": "Respuesta 1"},
    {"consigna": "Ítem 2", "respuesta": "Respuesta 2"}
  ]
}`;
      break;
    case 'oral':
      prompt += `Genera un guión para actividad de comunicación oral para estudiantes de 2º grado con las siguientes características:
- Formato: ${opciones.formato}
- Tema: ${opciones.tema}
- Instrucciones específicas: ${opciones.instrucciones}

La actividad debe ser apropiada para niños de 7-8 años, con vocabulario sencillo y estructuras simples.

Responde ÚNICAMENTE con un objeto JSON que siga esta estructura exacta, sin explicaciones, sin comentarios:

{
  "titulo": "Título de la actividad",
  "descripcion": "Breve descripción de la actividad",
  "instruccionesDocente": "Guía para el docente",
  "guionEstudiante": "Modelo o estructura para los estudiantes",
  "preguntasOrientadoras": ["Pregunta 1", "Pregunta 2", "Pregunta 3"],
  "criteriosEvaluacion": ["Criterio 1", "Criterio 2", "Criterio 3"]
}`;
      break;
    default:
      prompt += `Genera un recurso educativo para estudiantes de 2º grado sobre el tema ${opciones.tema || 'general'}.

IMPORTANTE: Responde ÚNICAMENTE el objeto JSON correspondiente, sin explicaciones ni comentarios.`;
  }

  // Agregar recordatorio final para alinear el recurso con el currículo
  prompt += `\n\nRecuerda alinear el recurso con las competencias del Currículo Nacional de Educación Básica del Perú para 2º grado en el área de Comunicación.`;
  
  return prompt;
}


/**
 * Intenta parsear un string a JSON de forma segura.
 * Se extraen todos los bloques JSON balanceados y se selecciona el último,
 * asumiendo que es el bloque final y correcto en caso de que haya texto extra.
 * @param {string} content - String recibido del modelo.
 * @returns {Object} - Objeto JSON.
 */
function parseJSON(content) {
  if (typeof content !== 'string') {
    throw new Error('Respuesta inválida: no es un string.');
  }

  const trimmedContent = content.trim();
  const candidates = [];
  let idx = 0;

  // Buscar todos los bloques JSON balanceados
  while (true) {
    const start = trimmedContent.indexOf('{', idx);
    if (start === -1) break;
    const candidate = extractBalancedJson(trimmedContent, start);
    if (candidate) {
      candidates.push(candidate);
      idx = start + candidate.length;
    } else {
      break;
    }
  }

  if (candidates.length === 0) {
    console.error('No se encontró objeto JSON en la respuesta:', trimmedContent);
    throw new Error('Respuesta inválida: no se encontró objeto JSON.');
  }

  // Seleccionar el último bloque JSON encontrado
  const jsonCandidate = candidates[candidates.length - 1];
  try {
    return JSON.parse(jsonCandidate);
  } catch (error) {
    console.error('Error al parsear el JSON extraído:', jsonCandidate);
    throw new Error('Respuesta recibida no se pudo convertir a JSON.');
  }
}

/**
 * Extrae un bloque JSON balanceado dado un índice de inicio en el texto.
 * @param {string} text - Texto a analizar.
 * @param {number} startIndex - Índice donde se encontró '{'.
 * @returns {string|null} - Bloque JSON extraído o null si no se encuentra uno completo.
 */
function extractBalancedJson(text, startIndex) {
  let braceCount = 0;
  let endIndex = -1;
  for (let i = startIndex; i < text.length; i++) {
    if (text[i] === '{') {
      braceCount++;
    } else if (text[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIndex = i;
        break;
      }
    }
  }
  if (endIndex !== -1) {
    return text.slice(startIndex, endIndex + 1);
  }
  return null;
}

export default { generarRecurso };