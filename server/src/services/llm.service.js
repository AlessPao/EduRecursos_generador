import axios from "axios";
import {
  llm_base_url,
  offenrouter_api_key,
  llm_model,
} from "../config/index.js";

/**
 *
 * @param {Object} params - Parámetros para generar el recurso
 * @returns {Promise<Object>}
 */
export async function generarRecurso(params) {
  const prompt = crearPrompt(params);

  const payload = {
    model: llm_model,
    messages: [
      {
        role: "system",
        content:
          "Eres un docente experto en comunicación para estudiantes de 2º grado (niños de 7-8 años) que crea materiales didácticos excepcionales alineados con el Currículo Nacional peruano.\n\nPRINCIPIOS FUNDAMENTALES PARA TODO CONTENIDO:\n\n1. ADAPTACIÓN PEDAGÓGICA PARA NIÑOS DE 7-8 AÑOS:\n   - Sin importar qué tan complejo sea el tema (ciencia, historia, conceptos abstractos), SIEMPRE adapta el contenido al nivel de comprensión de niños de 2º grado\n   - Usa EJEMPLOS CONCRETOS de la vida cotidiana que los niños conozcan (familia, escuela, juegos, naturaleza cercana)\n   - Emplea ANALOGÍAS SIMPLES para explicar conceptos difíciles (comparar con cosas que pueden ver, tocar o experimentar)\n   - Relaciona temas complejos con experiencias familiares: 'Es como cuando tú...'\n\n2. LENGUAJE Y ESTILO:\n   - Vocabulario sencillo y cotidiano, apropiado para la edad\n   - Oraciones cortas y claras (máximo 10-12 palabras)\n   - Evita términos técnicos; si son necesarios, explícalos con palabras simples\n   - Usa lenguaje afectivo y cercano que motive al niño\n\n3. CALIDAD Y COHERENCIA DEL CONTENIDO:\n   - Textos completos, coherentes y bien estructurados\n   - Desarrollo lógico de ideas con inicio, desarrollo y cierre\n   - Detalles suficientes para crear imágenes mentales claras\n   - Historias con sentido completo, personajes definidos y secuencia temporal clara\n   - NO omitir información importante ni dejar ideas incompletas\n\n4. ELEMENTOS PEDAGÓGICOS:\n   - Incorpora elementos visuales descriptivos (colores, tamaños, formas)\n   - Incluye acciones y emociones que los niños puedan identificar\n   - Fomenta la curiosidad y el asombro apropiado para la edad\n   - Refuerza valores positivos de manera natural\n\n5. EJEMPLOS DE ADAPTACIÓN:\n   - Tema complejo (fotosíntesis) → 'Las plantas comen luz del sol, como tú comes tus alimentos'\n   - Tema complejo (ciclo del agua) → 'El agua viaja como en un juego: sube al cielo, forma nubes y vuelve a bajar'\n   - Tema simple (paseo familiar) → Narración rica en detalles sensoriales, emociones y secuencia clara\n\nRECUERDA: Tu objetivo es que CUALQUIER tema sea accesible, interesante y memorable para niños de 7-8 años, manteniendo siempre alta calidad narrativa y coherencia.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.75,
    response_format: { type: "json_object" },
  };

  const headers = {
    Authorization: `Bearer ${offenrouter_api_key}`,
    "Content-Type": "application/json",
  };

  try {
    console.log("Enviando petición a LLM con modelo:", llm_model);
    const response = await axios.post(
      `${llm_base_url}/chat/completions`,
      payload,
      { headers }
    );

    // Log detallado de la respuesta
    console.log(
      "Respuesta completa del LLM:",
      JSON.stringify(response.data, null, 2)
    );

    // Validar la estructura de la respuesta
    if (!response.data) {
      console.error("Error: response.data es undefined");
      throw new Error("Respuesta vacía del servidor LLM");
    }

    if (!response.data.choices) {
      console.error("Error: response.data.choices es undefined");
      console.error("Estructura de response.data:", Object.keys(response.data));
      throw new Error("Estructura de respuesta inválida: falta choices");
    }

    if (!response.data.choices.length) {
      console.error("Error: response.data.choices está vacío");
      throw new Error("Respuesta inválida: choices vacío");
    }

    const choice = response.data.choices[0];
    if (!choice.message) {
      console.error("Error: choice.message es undefined");
      throw new Error("Respuesta inválida: falta message");
    }

    const content = choice.message.content;
    if (!content) {
      console.error("Error: content es undefined o vacío");
      throw new Error("Respuesta inválida: contenido vacío");
    }

    console.log("Contenido recibido del LLM:", content);

    const recurso = parseJSON(content);
    console.log(
      "Recurso parseado exitosamente:",
      JSON.stringify(recurso, null, 2)
    );

    // Validar que el recurso tenga contenido válido
    if (!recurso || Object.keys(recurso).length === 0) {
      console.log("Recurso vacío detectado, usando recurso por defecto");
      return getDefaultResource(params.tipo, params.opciones);
    }

    // Validar estructura según tipo
    if (!validateResourceStructure(recurso, params.tipo)) {
      console.log("Estructura de recurso inválida, usando recurso por defecto");
      return getDefaultResource(params.tipo, params.opciones);
    }

    return recurso;
  } catch (error) {
    console.error(
      "Error al generar recurso con LLM:",
      error.response?.data || error.message
    );
    console.error("Status:", error.response?.status);
    console.error("Headers:", error.response?.headers);

    // Reintento con manejo mejorado
    try {
      console.log("Reintentando petición a LLM...");

      // Modificar el payload para el reintento
      const retryPayload = {
        ...payload,
        temperature: 0.5, // Reducir temperatura para respuestas más consistentes
        max_tokens: 4000, // Limitar tokens para evitar respuestas truncadas
      };

      const retry = await axios.post(
        `${llm_base_url}/chat/completions`,
        retryPayload,
        { headers }
      );

      console.log(
        "Respuesta del reintento:",
        JSON.stringify(retry.data, null, 2)
      );

      if (!retry.data || !retry.data.choices || !retry.data.choices.length) {
        console.error("Error en reintento: estructura inválida");
        throw new Error(
          "Respuesta inválida en reintento: estructura de datos inesperada."
        );
      }

      const retryContent = retry.data.choices[0].message?.content;
      if (!retryContent) {
        console.error("Error en reintento: contenido vacío");
        throw new Error("Respuesta inválida en reintento: contenido vacío");
      }

      console.log("Contenido del reintento:", retryContent);
      const recurso = parseJSON(retryContent);
      console.log("Recurso del reintento parseado exitosamente");

      // Validar que el recurso del reintento tenga contenido válido
      if (!recurso || Object.keys(recurso).length === 0) {
        console.log("Recurso del reintento vacío, usando recurso por defecto");
        return getDefaultResource(params.tipo, params.opciones);
      }

      // Validar estructura según tipo
      if (!validateResourceStructure(recurso, params.tipo)) {
        console.log(
          "Estructura de recurso del reintento inválida, usando recurso por defecto"
        );
        return getDefaultResource(params.tipo, params.opciones);
      }

      return recurso;
    } catch (retryError) {
      console.error(
        "Error en segundo intento:",
        retryError.response?.data || retryError.message
      );
      console.error("Status del reintento:", retryError.response?.status);

      // Devolver un recurso por defecto en caso de fallo total
      console.log("Devolviendo recurso por defecto debido a fallos en LLM");
      return getDefaultResource(params.tipo, params.opciones);
    }
  }
}

/**
 * Crea el prompt adecuado según el tipo de recurso
 * @param {Object} params - Parámetros para el prompt
 * @returns {string} - Prompt generado
 */
function crearPrompt({ tipo, opciones }) {
  let prompt = "";

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
    case "evaluacion":
      prompt += `Genera un examen de opción múltiple de comprensión lectora para estudiantes de 2º grado con las siguientes características:
- Título: ${opciones.titulo}
- Tipo de texto: ${opciones.tipoTexto}
- Tema: ${opciones.tema}
- Longitud: ${opciones.longitud} palabras
- Preguntas literales: ${opciones.numLiteral}

REQUISITOS CRÍTICOS PARA EL TEXTO DEL EXAMEN:

1. ADAPTACIÓN DEL TEMA A NIÑOS DE 7-8 AÑOS:
   - Tema complejo (ciencia, historia, conceptos abstractos):
     * Explica usando COMPARACIONES con cosas conocidas
     * Usa EJEMPLOS DE LA VIDA DIARIA del niño
     * Simplifica sin perder exactitud: 'es como...', 'parecido a...'
   - Tema simple (historias, familia, naturaleza cercana):
     * Desarrolla con RICOS DETALLES sensoriales y emocionales
     * Crea NARRATIVA COMPLETA con secuencia clara
     * Incluye descripciones vívidas que el niño pueda imaginar

2. CALIDAD DEL TEXTO:
   - Texto COMPLETO, COHERENTE y bien ESTRUCTURADO
   - Oraciones cortas (8-12 palabras)
   - Vocabulario apropiado para 2º grado
   - Desarrollo lógico: inicio, desarrollo y cierre
   - Detalles suficientes para comprensión clara
   - NO omitir información importante

3. PREGUNTAS Y OPCIONES:
   - Preguntas literales claras sobre información explícita
   - Cada pregunta con 4 opciones de respuesta
   - Opciones claramente diferenciadas
   - Distractores plausibles pero incorrectos
   - Lenguaje simple en preguntas y opciones

Responde ÚNICAMENTE con un objeto JSON que siga esta estructura exacta, sin explicaciones, sin comentarios:

{
  "titulo": "Título del examen",
  "texto": "Contenido del texto completo, coherente y detallado",
  "preguntas": [
    { "pregunta": "Pregunta 1", "opciones": ["Opción A","Opción B","Opción C","Opción D"], "respuesta": "Opción A" },
    { "pregunta": "Pregunta 2", "opciones": ["Opción A","Opción B","Opción C","Opción D"], "respuesta": "Opción B" }
  ]
}`;
      break;
    case "comprension":
      prompt += `Genera una ficha de comprensión lectora para estudiantes de 2º grado con las siguientes características:
- Tipo de texto: ${opciones.tipoTexto}
- Tema: ${opciones.tema}
- Longitud: ${opciones.longitud} palabras
- Preguntas literales: ${opciones.numLiteral}
- Preguntas inferenciales: ${opciones.numInferencial}
- Preguntas críticas: ${opciones.numCritica}
${
  opciones.vocabulario
    ? "- Incluir sección de vocabulario con 5 palabras clave y sus definiciones apropiadas para niños"
    : ""
}

REQUISITOS CRÍTICOS PARA EL TEXTO:

1. ADAPTACIÓN DEL TEMA (CRUCIAL):
   - Si el tema es complejo (ciencia, tecnología, historia, conceptos abstractos):
     * Usa EJEMPLOS CONCRETOS de la vida del niño
     * Emplea ANALOGÍAS SIMPLES: compara con cosas conocidas
     * Relaciona con experiencias cotidianas (familia, escuela, juegos, naturaleza)
   - Si el tema es simple (historias cotidianas, paseos, animales domésticos):
     * Desarrolla con DETALLES SENSORIALES (colores, sonidos, olores, texturas)
     * Incluye EMOCIONES y ACCIONES que los niños reconozcan
     * Crea SECUENCIA CLARA con inicio, desarrollo y final bien definido

2. CALIDAD DEL TEXTO:
   - Texto COMPLETO y COHERENTE (no omitir información)
   - Oraciones cortas (8-12 palabras máximo)
   - Vocabulario sencillo y apropiado para 7-8 años
   - Estructura clara: introducción, desarrollo y cierre
   - Personajes o elementos bien descritos
   - NO dejar ideas incompletas o vagas

3. ELEMENTOS NARRATIVOS:
   - Usar conectores temporales simples: primero, después, luego, finalmente
   - Incluir detalles que ayuden a visualizar (colores, tamaños, formas)
   - Incorporar diálogos simples si es pertinente
   - Mantener consistencia en tiempo verbal (preferir presente o pasado simple)

4. PREGUNTAS:
   - Literales: sobre información explícita en el texto
   - Inferenciales: que requieran deducción simple basada en el texto
   - Críticas: que inviten a opinar o relacionar con experiencias personales
   - Todas deben ser claras y apropiadas para la edad

5. VOCABULARIO (si aplica):
   - Palabras clave del texto que puedan ser nuevas
   - Definiciones en lenguaje simple que un niño de 7-8 años entienda
   - Usar ejemplos en las definiciones cuando sea posible

Responde ÚNICAMENTE con un objeto JSON que siga esta estructura exacta, sin explicaciones, sin comentarios:

{
  "titulo": "Título atractivo y claro de la ficha",
  "texto": "Contenido del texto completo, coherente y detallado",
  "preguntas": [
    {"tipo": "literal", "pregunta": "Pregunta 1", "respuesta": "Respuesta 1"},
    {"tipo": "inferencial", "pregunta": "Pregunta 2", "respuesta": "Respuesta 2"},
    {"tipo": "critica", "pregunta": "Pregunta 3", "respuesta": "Respuesta 3"}
  ],
  "vocabulario": [
    {"palabra": "Palabra 1", "definicion": "Definición simple con ejemplo"},
    {"palabra": "Palabra 2", "definicion": "Definición simple con ejemplo"}
  ]
}`;
      break;
    case "escritura":
      prompt += `Genera una actividad de producción escrita para estudiantes de 2º grado con las siguientes características:
- Tipo de texto: ${opciones.tipoTexto}
- Tema: ${opciones.tema}
- Nivel de ayuda: ${opciones.nivelAyuda}
${opciones.conectores ? "- Incluir banco de conectores apropiados para niños" : ""}

REQUISITOS PARA LA ACTIVIDAD:

1. ADAPTACIÓN DEL TEMA:
   - Si el tema es complejo o abstracto:
     * Proporciona EJEMPLOS CONCRETOS que el niño conozca
     * Usa ANALOGÍAS SIMPLES para explicar el concepto
     * Relaciona con experiencias personales del niño
   - Si el tema es cotidiano:
     * Guía para incluir DETALLES SENSORIALES (qué vieron, oyeron, sintieron)
     * Sugiere incluir EMOCIONES y REACCIONES personales
     * Estructura clara de secuencia temporal

2. INSTRUCCIONES:
   - Lenguaje claro y directo para niños de 7-8 años
   - Pasos numerados y específicos
   - Ejemplos concretos cuando sea necesario
   - Motivación positiva para escribir

3. ESTRUCTURA Y APOYO:
   - Estructura propuesta adaptada al tipo de texto y tema
   - Conectores simples apropiados para la edad (primero, después, luego, finalmente, también, porque)
   - Lista de verificación con criterios que el niño pueda entender y revisar

4. ANDAMIAJE PEDAGÓGICO:
   - Considerar el nivel de ayuda solicitado
   - Proporcionar modelos o ejemplos si el nivel es alto
   - Preguntas guía para inspirar ideas
   - Vocabulario útil relacionado con el tema

Responde ÚNICAMENTE con un objeto JSON que siga esta estructura exacta, sin explicaciones, sin comentarios:

{
  "titulo": "Título atractivo de la actividad",
  "descripcion": "Breve descripción motivadora de la actividad",
  "instrucciones": "Instrucciones paso a paso claras y sencillas",
  "estructuraPropuesta": "Estructura sugerida para el texto con ejemplos",
  "conectores": ["Primero", "Después", "Luego", "Finalmente", "También", "Porque"],
  "listaVerificacion": ["Criterio 1 que el niño entienda", "Criterio 2 verificable", "Criterio 3 claro"]
}`;
      break;
    case "gramatica":
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
    case "oral":
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
    case "drag_and_drop":
      const tipoActividad = opciones.tipoActividad;
      // Determinar el tema final
      let temaFinal = opciones.tema || "cotidiano";
      if (
        opciones.temaPredefinido &&
        opciones.temaPredefinido !== "Otro (personalizado)"
      ) {
        temaFinal = opciones.temaPredefinido;
      } else if (
        opciones.temaPredefinido === "Otro (personalizado)" &&
        opciones.temaPersonalizado
      ) {
        temaFinal = opciones.temaPersonalizado;
      }

      // Determinar parámetros de longitud automáticamente según el tipo de actividad
      let longitudOracion;
      if (tipoActividad === "completar_oracion") {
        // Para completar oraciones, usar oraciones más largas para que tenga sentido
        longitudOracion = "Larga (5-6 palabras)";
      } else if (tipoActividad === "formar_oracion") {
        // Para formar oraciones, usar la selección del usuario o valor por defecto
        longitudOracion = opciones.longitudOracion || "Normal (4-5 palabras)";
      } else {
        longitudOracion = opciones.longitudOracion || "Normal (4-5 palabras)";
      }

      if (tipoActividad === "formar_oracion") {
        prompt += `El título de este recurso es "Juegos interactivos - Formar oraciones".\n\nGenera exactamente ${opciones.numActividades} actividades de tipo "formar_oracion" para estudiantes de 2º grado de primaria sobre el tema "${temaFinal}".\n\nPARÁMETROS DE CONFIGURACIÓN:\n- Tema: ${temaFinal}\n- Longitud de oraciones: ${longitudOracion}\n\nREGLAS CRÍTICAS PARA ORACIONES GRAMATICALMENTE PERFECTAS:\n\n1. ESTRUCTURA GRAMATICAL OBLIGATORIA:\n   - TODAS las oraciones DEBEN incluir ARTÍCULOS cuando sean necesarios (el, la, los, las, un, una)\n   - SIEMPRE verificar que la oración esté gramaticalmente COMPLETA\n   - Incluir PREPOSICIONES necesarias (en, de, con, a, por, para)\n   - NO omitir ninguna palabra funcional (artículos, preposiciones, conjunciones)\n\n2. VALIDACIÓN DE COHERENCIA:\n   - Lee la oración completa ANTES de generar las palabras\n   - Verifica que tenga: SUJETO + VERBO + COMPLEMENTO (si es necesario)\n   - Asegúrate que suene NATURAL cuando un niño la dice en voz alta\n   - Debe ser una oración que encuentres en libros infantiles\n\n3. CARACTERÍSTICAS DE CALIDAD:\n   - Flujo natural que los niños usarían al hablar\n   - Respetar la longitud especificada: ${longitudOracion}\n   - Primera palabra DEBE empezar con MAYÚSCULA\n   - Palabras mezcladas aleatoriamente en "opciones"\n   - Verbos de acción y descriptores naturales\n   - Contextos familiares para los niños\n   - Vocabulario apropiado para 2º grado (7-8 años)\n\nEJEMPLOS CORRECTOS CON ESTRUCTURA COMPLETA:\n\n🏖️ PLAYA/VERANO:\n✅ "Los niños juegan en la playa" → ["juegan", "Los", "en", "niños", "la", "playa"]\n✅ "En el verano hace calor" → ["el", "hace", "En", "verano", "calor"]\n✅ "Mi familia va a la playa" → ["familia", "la", "Mi", "playa", "va", "a"]\n✅ "El sol brilla en verano" → ["El", "brilla", "verano", "sol", "en"]\n\n🏠 FAMILIA:\n✅ "Mi hermana canta muy bonito" → ["canta", "hermana", "Mi", "muy", "bonito"]\n✅ "Papá prepara el desayuno rico" → ["rico", "prepara", "Papá", "el", "desayuno"]\n✅ "La abuela cuenta cuentos lindos" → ["lindos", "cuenta", "La", "abuela", "cuentos"]\n\n🐾 ANIMALES:\n✅ "El perro corre muy rápido" → ["muy", "perro", "corre", "El", "rápido"]\n✅ "Los gatos duermen en casa" → ["en", "gatos", "duermen", "Los", "casa"]\n✅ "Mi pájaro canta de día" → ["de", "pájaro", "canta", "Mi", "día"]\n\n🏫 ESCUELA:\n✅ "Los niños juegan en el patio" → ["patio", "niños", "juegan", "Los", "en", "el"]\n✅ "La maestra explica muy bien" → ["bien", "explica", "La", "maestra", "muy"]\n✅ "Mis amigos estudian con alegría" → ["con", "amigos", "estudian", "Mis", "alegría"]\n\n❌ EVITAR ESTOS ERRORES COMUNES:\n- ❌ "Los niños juegan en playa" (falta artículo "la")\n- ❌ "Los niños juegan playa verano" (falta preposición "en" y artículo)\n- ❌ "La madre hace comida" (muy robótico, mejor: "Mamá cocina comida rica")\n- ❌ "El niño tiene lápiz" (falta artículo, mejor: "El niño tiene un lápiz")\n- ❌ "Los estudiantes escuela" (falta verbo y preposición)\n- ❌ "Perro corre rápido" (falta artículo "El")\n\nPROCESO DE VERIFICACIÓN OBLIGATORIO:\n1. Escribe la oración completa con TODAS las palabras necesarias\n2. Lee la oración en voz alta mentalmente\n3. Verifica que tenga artículos, preposiciones y estructura completa\n4. Confirma que suena natural para un niño de 7-8 años\n5. SOLO ENTONCES genera el array de "opciones" mezcladas y "respuesta" ordenada\n\nEstructura JSON requerida:\n\n{\n  "titulo": "Juegos interactivos - Formar oraciones",\n  "actividades": [\n    {\n      "tipo": "formar_oracion",\n      "enunciado": "Arrastra las palabras para formar la oración correcta sobre ${temaFinal}.",\n      "opciones": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5"],\n      "respuesta": ["Palabra1", "palabra2", "palabra3", "palabra4", "palabra5"]\n    }\n  ]\n}`;
      } else if (tipoActividad === "completar_oracion") {
        prompt += `El título de este recurso es "Juegos interactivos - Completar oraciones".\n\nGenera exactamente ${opciones.numActividades} actividades de tipo "completar_oracion" para estudiantes de 2º grado de primaria sobre el tema "${temaFinal}".\n\nPARÁMETROS DE CONFIGURACIÓN:\n- Tema: ${temaFinal}\n- Longitud de oraciones: ${longitudOracion} (ajustada automáticamente para oraciones completas)\n\nCARACTERÍSTICAS CRÍTICAS - MUY IMPORTANTE:\n- TODAS las actividades deben ser tipo "completar_oracion"\n- Para cada actividad:\n  - El campo "enunciado" DEBE contener EXACTAMENTE 5 guiones bajos seguidos: _____\n  - NUNCA incluir la respuesta completa en el enunciado\n  - La oración debe ser más larga (5-6 palabras) para que tenga sentido completarla\n  - La oración debe sonar como algo que un niño diría naturalmente\n  - Primera letra MAYÚSCULA, punto final\n  - Exactamente 4 opciones: 1 correcta + 3 claramente incorrectas\n  - Las opciones incorrectas NO deben tener sentido en el contexto\n  - Usar vocabulario familiar y cotidiano apropiado para 2º grado\n  - Contextos que los niños reconozcan fácilmente\n  - La palabra que falta debe ser significativa (sustantivo, adjetivo o verbo importante)\n  - Evitar que falten artículos o preposiciones (deben faltar palabras con contenido)\n\nEJEMPLOS CORRECTOS (SIGUE ESTE FORMATO EXACTO):\n\n🏠 FAMILIA:\n✅ "Mi mamá cocina un pastel muy _____." \n   Opciones: ["rico", "mesa", "libro", "zapato"] → Respuesta: ["rico"]\n✅ "El bebé llora cuando tiene mucha _____." \n   Opciones: ["hambre", "lápiz", "silla", "pared"] → Respuesta: ["hambre"]\n✅ "Mi papá trabaja en la oficina muy _____." \n   Opciones: ["duro", "flor", "pez", "silla"] → Respuesta: ["duro"]\n✅ "La abuela me cuenta historias muy _____." \n   Opciones: ["lindas", "carro", "puerta", "ventana"] → Respuesta: ["lindas"]\n\n🐾 ANIMALES:\n✅ "El perro mueve la _____ cuando está feliz." \n   Opciones: ["cola", "mesa", "casa", "lápiz"] → Respuesta: ["cola"]\n✅ "Los peces nadan en el _____ del parque." \n   Opciones: ["agua", "árbol", "cielo", "libro"] → Respuesta: ["agua"]\n✅ "Mi gato duerme en la cama muy _____." \n   Opciones: ["tranquilo", "comida", "pelota", "árbol"] → Respuesta: ["tranquilo"]\n✅ "Las mariposas vuelan por el jardín con _____." \n   Opciones: ["gracia", "piedra", "silla", "reloj"] → Respuesta: ["gracia"]\n\n🏫 ESCUELA:\n✅ "Los niños escriben con el _____ azul." \n   Opciones: ["lápiz", "perro", "comida", "árbol"] → Respuesta: ["lápiz"]\n✅ "En el recreo jugamos en el patio con _____." \n   Opciones: ["alegría", "refrigerador", "cama", "televisión"] → Respuesta: ["alegría"]\n✅ "La maestra explica en la _____ grande." \n   Opciones: ["pizarra", "cocina", "carro", "flor"] → Respuesta: ["pizarra"]\n✅ "Mis amigos comparten sus juguetes con mucha _____." \n   Opciones: ["generosidad", "mesa", "ventana", "puerta"] → Respuesta: ["generosidad"]\n\n🌞 NATURALEZA:\n✅ "El sol brilla en el cielo muy _____." \n   Opciones: ["brillante", "zapato", "cuchara", "camión"] → Respuesta: ["brillante"]\n✅ "Las flores del jardín son muy _____." \n   Opciones: ["bonitas", "silla", "plato", "techo"] → Respuesta: ["bonitas"]\n✅ "Los pájaros cantan en el árbol todas las _____." \n   Opciones: ["mañanas", "carro", "pared", "mesa"] → Respuesta: ["mañanas"]\n\n❌ EVITAR COMPLETAMENTE:\n- "Mi papá trabaja duro." (NO debe mostrar la respuesta completa)\n- "El niño come _____." (muy simple, oración debe ser más larga)\n- Opciones múltiples correctas: "Mi _____ me quiere" ["mamá", "papá", "hermana"]\n- Oraciones artificiales: "El objeto está en lugar"\n- Que falten artículos o preposiciones: "Los niños juegan en _____" ["el", "la", "un"] ❌\n- Oraciones demasiado cortas (menos de 5 palabras)\n\nEstructura JSON requerida (FORMATO OBLIGATORIO):\n\n{\n  "titulo": "Juegos interactivos - Completar oraciones",\n  "actividades": [\n    {\n      "tipo": "completar_oracion",\n      "enunciado": "Mi mamá cocina un pastel muy _____.",\n      "opciones": ["rico", "mesa", "libro", "zapato"],\n      "respuesta": ["rico"]\n    }\n  ]\n}`;
      } else {
        prompt += `Error: Tipo de actividad no válido. Debe ser "formar_oracion" o "completar_oracion".`;
      }

      prompt += `\n\nRECUERDA:\n- Generar exactamente ${opciones.numActividades} actividades\n- Todas deben ser del tipo "${tipoActividad}"\n- Tema: "${temaFinal}"\n- Vocabulario apropiado para 2º grado\n- Alineado con el Currículo Nacional peruano de Comunicación`;
      break;
    case "ice_breakers":
      const tipoIceBreaker = opciones.tipoIceBreaker;
      const temaIce = opciones.tema || "general";
      const numActividadesIce = opciones.numeroActividades || 2;

      prompt += `Genera exactamente ${numActividadesIce} actividades de ice breakers (rompehielos) para estudiantes de 2º grado con las siguientes características:

PARÁMETROS:
- Tipo de ice breaker: ${tipoIceBreaker}
${tipoIceBreaker === "adivina_quien_soy" ? `- Tema: ${temaIce}` : ""}

CARACTERÍSTICAS GENERALES:
- Apropiadas para niños de 7-8 años
- Fomentan la participación y desinhibición
- Usan vocabulario sencillo y comprensible
- Incluyen instrucciones claras para el docente
- Promueven un ambiente positivo y acogedor
- Alineadas con el desarrollo de competencias comunicativas

`;

      switch (tipoIceBreaker) {
        case "adivina_quien_soy":
          prompt += `TIPO: "Adivina quién soy"
OBJETIVOS: Comprensión oral, inferencia, vocabulario

IMPORTANTE - SELECCIÓN DE ELEMENTOS:
${
  temaIce === "animales"
    ? `
Para el tema ANIMALES, usa ÚNICAMENTE animales simples y comunes que los niños de 2º grado conocen bien:
- Animales domésticos: perro, gato, conejo, pez, pájaro, gallina, vaca, caballo, cerdo, oveja
- Animales salvajes conocidos: león, elefante, jirafa, mono, oso, tigre, hipopótamo, cocodrilo
- Evitar animales exóticos o poco conocidos
- Usar características físicas y comportamientos evidentes y fáciles de identificar
`
    : temaIce === "alimentos"
    ? `
Para el tema ALIMENTOS, usa comidas comunes y familiares para niños:
- Frutas: manzana, plátano, naranja, uvas, fresa, piña
- Verduras: zanahoria, tomate, lechuga, papa, cebolla
- Otros: pan, leche, huevo, queso, arroz, pasta
- Evitar alimentos poco comunes o regionales específicos
`
    : ""
}

Para cada actividad genera:
- 3-4 pistas progresivas (de más difícil a más fácil)
- Pistas que describan características físicas obvias, sonidos, hábitat y comportamientos
- Respuesta clara usando el nombre común del animal/alimento
- Pistas adicionales para estudiantes que necesiten más ayuda
- Vocabulario adecuado para la edad (evitar términos técnicos)

ESTRUCTURA JSON REQUERIDA:
{
  "titulo": "Ice Breakers - Adivina quién soy",
  "descripcion": "Actividades de adivinanzas con pistas para desarrollar comprensión oral e inferencia",
  "actividades": [
    {
      "nombre": "Adivina el [animal/objeto/personaje]",
      "instrucciones": "El docente lee las pistas una por una. Los estudiantes levantan la mano para adivinar.",
      "desarrollo": "Pasos detallados de la actividad",
      "participantes": "Toda la clase",
      "contenidoEspecifico": {
        "tema": "${temaIce}",
        "pistas": [
          {"orden": 1, "pista": "Primera pista (más difícil)"},
          {"orden": 2, "pista": "Segunda pista (intermedia)"},
          {"orden": 3, "pista": "Tercera pista (más fácil)"}
        ],
        "respuesta": "respuesta correcta",
        "pistasFaciles": ["pista adicional si necesitan ayuda"],
        "extension": "Actividad adicional relacionada"
      }
    }
  ],
  "objetivos": ["Comprensión oral", "Inferencia", "Vocabulario temático"],
  "variaciones": ["Variación 1", "Variación 2"]
}`;
          break;
        case "dibuja_lo_que_digo":
          prompt += `TIPO: "Dibuja lo que digo"
OBJETIVOS: Comprensión auditiva, atención, vocabulario espacial

IMPORTANTE - CONTENIDO APROPIADO:
- Usar descripciones simples y claras que los niños puedan dibujar fácilmente
- Incluir elementos familiares: casa, árbol, sol, nube, flores, personas, animales domésticos
- Usar vocabulario espacial básico: arriba, abajo, al lado, dentro, fuera, grande, pequeño
- Evitar detalles complicados o elementos que requieran habilidades artísticas avanzadas
- Hacer descripciones paso a paso, construyendo la imagen gradualmente

Para cada actividad genera:
- Descripción clara y detallada apropiada para dibujar
- Elementos clave que deben aparecer en el dibujo (máximo 5-6 elementos)
- Vocabulario objetivo (preposiciones, adjetivos descriptivos básicos)
- Criterios simples de evaluación (presencia de elementos principales)

ESTRUCTURA JSON REQUERIDA:
{
  "titulo": "Ice Breakers - Dibuja lo que digo",
  "descripcion": "Actividades de dibujo dirigido para desarrollar comprensión auditiva y vocabulario",
  "actividades": [
    {
      "nombre": "Dibuja la escena de [tema]",
      "instrucciones": "Lee la descripción pausadamente. Los estudiantes dibujan mientras escuchan.",
      "desarrollo": "Pasos detallados de la actividad",
      "participantes": "Individual",
      "materiales": ["Papel", "Lápices de colores"],
      "contenidoEspecifico": {
        "descripcion": "Descripción completa para dibujar",
        "elementosClave": ["elemento1", "elemento2", "elemento3"],
        "vocabularioObjetivo": ["palabra1", "palabra2", "palabra3"],
        "criteriosEvaluacion": ["Incluye todos los elementos", "Posiciones correctas"],
        "modalidad": "oral",
        "extension": "Los estudiantes explican su dibujo"
      }
    }
  ],
  "objetivos": ["Comprensión auditiva", "Atención sostenida", "Vocabulario espacial"],
  "variaciones": ["Trabajar en parejas", "Dibujo colaborativo"]
}`;
          break;
        case "tres_cosas_sobre_mi":
          prompt += `TIPO: "Tres cosas sobre mí"
OBJETIVOS: Expresión oral, autoconocimiento, escucha activa

IMPORTANTE - PLANTILLAS APROPIADAS:
Esta actividad se genera automáticamente con plantillas de frases universales y apropiadas para niños de 7-8 años.

Para cada actividad genera plantillas que sean:
- Simples y fáciles de completar
- Apropiadas para la edad (gustos, preferencias, familia, juegos)
- Que promuevan autoconocimiento positivo
- Que no sean muy personales o íntimas
- Que todos los niños puedan responder cómodamente

Ejemplos de buenas plantillas:
- "Me gusta..." (comida, color, juego, animal)
- "Mi favorito es..." (juguete, cuento, deporte)
- "En mi familia somos..." (número de personas, mascotas)
- "Cuando tengo tiempo libre me gusta..." (actividades)
- "Mi color/animal/comida favorita es..."

Para cada actividad genera:
- Plantillas de frases apropiadas para la edad
- Ejemplos diversos para cada plantilla (sin ser repetitivos)
- Ejemplos diversos para cada plantilla
- Apoyo visual para estudiantes tímidos
- Estrategias de participación gradual

ESTRUCTURA JSON REQUERIDA:
{
  "titulo": "Ice Breakers - Tres cosas sobre mí",
  "descripcion": "Actividades de presentación personal para fomentar expresión oral y autoconocimiento",
  "actividades": [
    {
      "nombre": "Comparto mis gustos",
      "instrucciones": "Cada estudiante completa las tres frases. Comenzar con voluntarios.",
      "desarrollo": "Pasos detallados de la actividad",
      "participantes": "Individual con grupo",
      "contenidoEspecifico": {
        "frases": [
          {
            "template": "Me gusta...",
            "ejemplos": ["ejemplo1", "ejemplo2", "ejemplo3"]
          },
          {
            "template": "No me gusta...",
            "ejemplos": ["ejemplo1", "ejemplo2", "ejemplo3"]
          },
          {
            "template": "Mi [algo] favorito es...",
            "ejemplos": ["ejemplo1", "ejemplo2", "ejemplo3"]
          }
        ],
        "apoyoVisual": "Lista de opciones con dibujos para estudiantes tímidos",
        "extension": "Encontrar compañeros con gustos similares"
      }
    }
  ],
  "objetivos": ["Expresión oral", "Autoconocimiento", "Escucha activa"],
  "variaciones": ["Compartir en parejas primero", "Usar tarjetas con imágenes"]
}`;
          break;
        default:
          prompt += `Error: Tipo de ice breaker no válido. Debe ser uno de: "adivina_quien_soy", "dibuja_lo_que_digo", "tres_cosas_sobre_mi".`;
      }

      prompt += `\n\nIMPORTANTE:
- Todas las actividades deben ser del tipo "${tipoIceBreaker}"
- Generar exactamente ${numActividadesIce} actividades
- Tema: "${temaIce}"
- Vocabulario y situaciones apropiados para 2º grado (niños de 7-8 años)
- Contenido que sea natural, lógico y familiar para los niños
- Evitar elementos complicados, exóticos o poco conocidos
- Fomentar participación activa y ambiente positivo
- Usar lenguaje claro y sencillo`;
      break;
    default:
      prompt += `Genera un recurso educativo para estudiantes de 2º grado sobre el tema ${
        opciones.tema || "general"
      }.

IMPORTANTE: Responde ÚNICAMENTE el objeto JSON correspondiente, sin explicaciones ni comentarios.`;
  }

  // Agregar recordatorio final para alinear el recurso con el currículo
  prompt += `\n\nRecuerda alinear el recurso con las competencias del Currículo Nacional de Educación Básica del Perú para 2º grado en el área de Comunicación.`;

  return prompt;
}

/**
 * Valida que el recurso tenga la estructura mínima necesaria según su tipo
 * @param {Object} recurso - Recurso a validar
 * @param {string} tipo - Tipo de recurso
 * @returns {boolean} - True si es válido
 */
function validateResourceStructure(recurso, tipo) {
  if (!recurso || typeof recurso !== "object") {
    return false;
  }

  switch (tipo) {
    case "comprension":
      return (
        recurso.texto && recurso.preguntas && Array.isArray(recurso.preguntas)
      );
    case "escritura":
      return recurso.descripcion && recurso.instrucciones;
    case "evaluacion":
      return (
        recurso.texto && recurso.preguntas && Array.isArray(recurso.preguntas)
      );
    case "gramatica":
      return (
        recurso.instrucciones && recurso.items && Array.isArray(recurso.items)
      );
    case "oral":
      return recurso.descripcion && recurso.instruccionesDocente;
    case "drag_and_drop":
      return (
        recurso.actividades &&
        Array.isArray(recurso.actividades) &&
        recurso.actividades.length > 0
      );
    case "ice_breakers":
      return (
        recurso.actividades &&
        Array.isArray(recurso.actividades) &&
        recurso.actividades.length > 0
      );
    default:
      return true; // Para tipos no especificados, aceptar cualquier estructura
  }
}

/**
 * Devuelve un recurso por defecto cuando el LLM falla
 */
function getDefaultResource(tipo, opciones) {
  const titulo = opciones.titulo || `Recurso de ${tipo}`;

  switch (tipo) {
    case "comprension":
      return {
        titulo,
        texto:
          "Este es un texto de ejemplo para comprensión lectora. Los estudiantes deben leer atentamente y responder las preguntas.",
        preguntas: [
          {
            tipo: "literal",
            pregunta: "¿De qué trata el texto?",
            respuesta: "Respuesta de ejemplo",
          },
        ],
        vocabulario: opciones.vocabulario
          ? [{ palabra: "ejemplo", definicion: "Modelo o muestra de algo" }]
          : undefined,
      };

    case "escritura":
      return {
        titulo,
        descripcion: "Actividad de escritura para estudiantes de 2° grado",
        instrucciones:
          "Escribe un texto siguiendo las indicaciones del docente",
        estructuraPropuesta: "Introducción, desarrollo y conclusión",
        conectores: ["Primero", "Luego", "Finalmente"],
        listaVerificacion: ["Revisar ortografía", "Verificar coherencia"],
      };

    case "evaluacion":
      return {
        titulo,
        texto:
          "Los animales son seres vivos que habitan en diferentes lugares. Algunos viven en el agua, otros en la tierra y algunos pueden volar por el cielo.",
        preguntas: [
          {
            pregunta: "¿Dónde viven los animales?",
            opciones: [
              "Solo en el agua",
              "En diferentes lugares",
              "Solo en la tierra",
              "Solo en el cielo",
            ],
            respuesta: "En diferentes lugares",
          },
        ],
      };

    case "gramatica":
      return {
        titulo,
        instrucciones: "Completa los ejercicios siguiendo el ejemplo",
        ejemplo: "La niña come manzana",
        items: [
          {
            consigna: "Escribe una oración con la palabra 'casa'",
            respuesta: "Mi casa es bonita",
          },
        ],
      };

    case "oral":
      return {
        titulo,
        descripcion: "Actividad de comunicación oral",
        instruccionesDocente: "Guíe a los estudiantes en la actividad",
        guionEstudiante: "Estructura básica para la presentación",
        preguntasOrientadoras: ["¿Qué quieres contar?", "¿Cómo te sientes?"],
        criteriosEvaluacion: ["Habla claro", "Usa palabras adecuadas"],
      };

    case "drag_and_drop":
      return {
        titulo: "Juegos interactivos - Actividad básica",
        actividades: [
          {
            tipo: "formar_oracion",
            enunciado: "Arrastra las palabras para formar la oración correcta.",
            opciones: ["El", "perro", "corre", "rápido"],
            respuesta: ["El", "perro", "corre", "rápido"],
          },
        ],
      };

    case "ice_breakers":
      return {
        titulo: "Ice Breakers - Actividad básica",
        descripcion:
          "Actividades de rompehielos para iniciar clases de forma dinámica",
        actividades: [
          {
            nombre: "Adivina el animal",
            instrucciones:
              "El docente lee las pistas una por una. Los estudiantes levantan la mano para adivinar.",
            desarrollo:
              "1. Presentar la actividad, 2. Leer primera pista, 3. Esperar respuestas, 4. Continuar con más pistas si es necesario",
            participantes: "Toda la clase",
            contenidoEspecifico: {
              tema: "animales",
              pistas: [
                {
                  orden: 1,
                  pista: "Tengo orejas muy largas y las muevo mucho",
                },
                { orden: 2, pista: "Me gusta comer zanahorias y lechuga" },
                {
                  orden: 3,
                  pista: "Salto muy alto con mis patas traseras fuertes",
                },
                {
                  orden: 4,
                  pista: "Soy pequeño, suave y vivo en una conejera",
                },
              ],
              respuesta: "conejo",
              pistasFaciles: ["Hago sonidos como 'ñac ñac' cuando como"],
              extension: "Los estudiantes pueden imitar cómo salta el animal",
            },
          },
        ],
        objetivos: [
          "Comprensión oral",
          "Inferencia",
          "Vocabulario de animales",
        ],
        variaciones: [
          "Usar imágenes como apoyo",
          "Los estudiantes crean sus propias pistas",
        ],
      };

    default:
      return {
        titulo,
        contenido:
          "Recurso generado por defecto debido a un error temporal. Por favor, intente nuevamente.",
      };
  }
}

/**
 * Intenta parsear un string a JSON de forma segura.
 * Se extraen todos los bloques JSON balanceados y se selecciona el último,
 * asumiendo que es el bloque final y correcto en caso de que haya texto extra.
 * @param {string} content - String recibido del modelo.
 * @returns {Object} - Objeto JSON.
 */
function parseJSON(content) {
  try {
    console.log(
      "Intentando parsear contenido:",
      content.substring(0, 500) + "..."
    );

    if (typeof content !== "string") {
      throw new Error("Respuesta inválida: no es un string.");
    }

    // Limpiar el contenido de caracteres no deseados
    let cleanContent = content.trim();

    // Remover markdown code blocks si existen
    cleanContent = cleanContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "");

    // Buscar el primer { y el último }
    const firstBrace = cleanContent.indexOf("{");
    const lastBrace = cleanContent.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      console.error("No se encontraron llaves JSON válidas");
      throw new Error("Formato JSON inválido: no se encontraron llaves");
    }

    const jsonString = cleanContent.substring(firstBrace, lastBrace + 1);
    console.log("JSON extraído:", jsonString.substring(0, 200) + "...");

    const parsed = JSON.parse(jsonString);
    console.log("JSON parseado exitosamente");
    return parsed;
  } catch (error) {
    console.error("Error al parsear JSON:", error.message);
    console.error("Contenido problemático:", content);

    // Intentar una limpieza más agresiva usando el método original
    try {
      const trimmedContent = content.trim();
      const candidates = [];
      let idx = 0;

      // Buscar todos los bloques JSON balanceados
      while (true) {
        const start = trimmedContent.indexOf("{", idx);
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
        console.error(
          "No se encontró objeto JSON en la respuesta:",
          trimmedContent
        );
        throw new Error("Respuesta inválida: no se encontró objeto JSON.");
      }

      // Seleccionar el último bloque JSON encontrado
      const jsonCandidate = candidates[candidates.length - 1];
      const parsed = JSON.parse(jsonCandidate);
      console.log("JSON parseado con método alternativo");
      return parsed;
    } catch (secondError) {
      console.error("Segundo intento de parseo falló:", secondError.message);
      throw new Error(`Error al parsear respuesta JSON: ${error.message}`);
    }
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
    if (text[i] === "{") {
      braceCount++;
    } else if (text[i] === "}") {
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
