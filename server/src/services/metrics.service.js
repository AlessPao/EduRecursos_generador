import natural from 'natural';

/**
 * Servicio para analizar métricas semánticas del contenido de recursos educativos
 */

/**
 * Extrae el texto relevante de un recurso según su tipo
 * @param {Object} recurso - Recurso educativo
 * @returns {string[]} - Array de textos extraídos
 */
function extractTextFromResource(recurso) {
  const texts = [];
  const { tipo, contenido } = recurso;

  try {
    switch (tipo) {
      case 'comprension':
        if (contenido.texto) texts.push(contenido.texto);
        if (contenido.preguntas) {
          contenido.preguntas.forEach(pregunta => {
            if (pregunta.pregunta) texts.push(pregunta.pregunta);
            if (pregunta.opciones) {
              pregunta.opciones.forEach(opcion => texts.push(opcion));
            }
          });
        }
        break;

      case 'escritura':
        if (contenido.descripcion) texts.push(contenido.descripcion);
        if (contenido.instrucciones) texts.push(contenido.instrucciones);
        if (contenido.estructuraPropuesta) texts.push(contenido.estructuraPropuesta);
        if (contenido.conectores) {
          contenido.conectores.forEach(conector => texts.push(conector));
        }
        if (contenido.listaVerificacion) {
          contenido.listaVerificacion.forEach(item => texts.push(item));
        }
        break;

      case 'gramatica':
        if (contenido.instrucciones) texts.push(contenido.instrucciones);
        if (contenido.ejemplo) texts.push(contenido.ejemplo);
        if (contenido.items) {
          contenido.items.forEach(item => {
            if (item.consigna) texts.push(item.consigna);
            if (item.respuesta) texts.push(item.respuesta);
          });
        }
        break;

      case 'oral':
        if (contenido.descripcion) texts.push(contenido.descripcion);
        if (contenido.instruccionesDocente) texts.push(contenido.instruccionesDocente);
        if (contenido.guionEstudiante) texts.push(contenido.guionEstudiante);
        if (contenido.preguntasOrientadoras) {
          contenido.preguntasOrientadoras.forEach(pregunta => texts.push(pregunta));
        }
        if (contenido.criteriosEvaluacion) {
          contenido.criteriosEvaluacion.forEach(criterio => texts.push(criterio));
        }
        break;

      case 'drag_and_drop':
        if (contenido.actividades) {
          contenido.actividades.forEach(actividad => {
            if (actividad.enunciado) texts.push(actividad.enunciado);
            if (actividad.opciones) {
              actividad.opciones.forEach(opcion => texts.push(opcion));
            }
            if (actividad.respuesta) {
              actividad.respuesta.forEach(respuesta => texts.push(respuesta));
            }
          });
        }
        break;

      case 'ice_breakers':
        if (contenido.actividades) {
          contenido.actividades.forEach(actividad => {
            if (actividad.nombre) texts.push(actividad.nombre);
            if (actividad.descripcion) texts.push(actividad.descripcion);
            if (actividad.instrucciones) texts.push(actividad.instrucciones);
            if (actividad.contenidoEspecifico) {
              const contenidoEsp = actividad.contenidoEspecifico;
              if (contenidoEsp.frases) {
                contenidoEsp.frases.forEach(frase => {
                  if (frase.template) texts.push(frase.template);
                  if (frase.ejemplos) {
                    frase.ejemplos.forEach(ejemplo => texts.push(ejemplo));
                  }
                });
              }
              if (contenidoEsp.pistas) {
                contenidoEsp.pistas.forEach(pista => texts.push(pista));
              }
            }
          });
        }
        break;

      default:
        console.warn(`Tipo de recurso no reconocido: ${tipo}`);
    }
  } catch (error) {
    console.error('Error extrayendo texto del recurso:', error);
  }

  // Filtrar textos vacíos y limpiar
  return texts
    .filter(text => text && typeof text === 'string' && text.trim().length > 0)
    .map(text => text.trim());
}

/**
 * Divide un texto en oraciones
 * @param {string} text - Texto a analizar
 * @returns {string[]} - Array de oraciones
 */
function extractSentences(text) {
  // Limpiar el texto
  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim();

  // Dividir por signos de puntuación que terminan oraciones
  const sentences = cleanText
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)
    .filter(sentence => {
      // Filtrar fragmentos muy cortos que probablemente no sean oraciones completas
      const words = sentence.split(/\s+/).filter(word => word.length > 0);
      return words.length >= 2; // Al menos 2 palabras para considerar una oración
    });

  return sentences;
}

/**
 * Verifica si una oración es gramaticalmente correcta básicamente
 * @param {string} sentence - Oración a analizar
 * @returns {boolean} - True si parece correcta
 */
function isGrammaticallyCorrect(sentence) {
  // Normalizar la oración
  const normalizedSentence = sentence.trim().toLowerCase();
  
  // Verificaciones básicas de gramática para español
  const checks = {
    // La oración debe tener al menos un verbo común
    hasVerb: /\b(es|son|está|están|tiene|tienen|hace|hacen|va|van|viene|vienen|dice|dicen|puede|pueden|debe|deben|quiere|quieren|come|comen|vive|viven|juega|juegan|estudia|estudian|trabaja|trabajan|duerme|duermen|canta|cantan|baila|bailan|lee|leen|escribe|escriben|habla|hablan|camina|caminan|corre|corren|salta|saltan|ríe|ríen|llora|lloran|ama|aman|cuida|cuidan|enseña|enseñan|aprende|aprenden|mira|miran|escucha|escuchan|toca|tocan|abraza|abrazan|besa|besan|ayuda|ayudan|cocina|cocinan|limpia|limpian|guarda|guardan|abre|abren|cierra|cierran|encuentra|encuentran|busca|buscan|da|dan|recibe|reciben|trae|traen|lleva|llevan|pone|ponen|saca|sacan|compra|compran|vende|venden|gana|ganan|pierde|pierden|gusta|gustan|sirve|sirven|funciona|funcionan|empieza|empiezan|termina|terminan|continúa|continúan|para|paran|sigue|siguen|regresa|regresan|llega|llegan|sale|salen|entra|entran|sube|suben|baja|bajan)\b/.test(normalizedSentence),
    
    // Debe tener estructura básica de sujeto (artículo/pronombre + sustantivo o solo sustantivo)
    hasSubject: /\b(el|la|los|las|un|una|unos|unas|mi|tu|su|nuestro|nuestra|yo|tú|él|ella|nosotros|nosotras|ellos|ellas|este|esta|estos|estas|ese|esa|esos|esas|aquel|aquella|aquellos|aquellas|niño|niña|niños|niñas|mamá|papá|hermano|hermana|abuelo|abuela|maestro|maestra|doctor|doctora|perro|perro|gato|gata|casa|escuela|familia|amigo|amiga|libro|mesa|silla|árbol|flor|sol|luna|agua|comida|juego|película|música|canción|baile|fiesta|regalo|cumpleaños|vacaciones|parque|playa|montaña|ciudad|pueblo|carro|bicicleta|avión|tren|teléfono|computadora|televisión|radio|reloj|zapatos|ropa|camisa|pantalón|vestido|sombrero|pelota|muñeca|juguete|animal|pájaro|pez|caballo|vaca|pollo|cerdo|ratón|elefante|león|tigre|oso|mono|conejo|tortuga|serpiente|araña|mariposa|abeja|hormiga|mosca|color|rojo|azul|verde|amarillo|negro|blanco|rosa|morado|naranja|café|grande|pequeño|alto|bajo|gordo|flaco|bonito|feo|bueno|malo|feliz|triste|alegre|enojado|cansado|despierto|dormido|limpio|sucio|nuevo|viejo|caliente|frío|dulce|salado|rico|sabroso|fácil|difícil|rápido|lento|fuerte|débil|cerca|lejos|arriba|abajo|dentro|fuera|aquí|allí|hoy|ayer|mañana|temprano|tarde|noche|día|semana|mes|año|lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/.test(normalizedSentence),
    
    // No debe tener patrones claramente incorrectos
    noDoubleArticles: !/\b(el la|la el|un una|una un|los las|las los)\b/.test(normalizedSentence),
    
    // No debe empezar con preposiciones sin contexto
    noStartWithPreposition: !/^(en|de|con|por|para|sin|sobre|bajo|entre|desde|hasta|durante|mediante|según|contra|hacia|ante|tras)\s/.test(normalizedSentence),
    
    // No debe tener repeticiones obvias de palabras
    noObviousRepetition: !/\b(\w+)\s+\1\b/.test(normalizedSentence),
    
    // Debe empezar con mayúscula si es una oración completa
    startsWithCapital: /^[A-ZÁÉÍÓÚÑÜ]/.test(sentence.trim()),
    
    // No debe ser solo una palabra
    multipleWords: sentence.trim().split(/\s+/).length > 1,
    
    // No debe tener caracteres extraños o patrones sin sentido
    noWeirdPatterns: !/[0-9]{3,}|[^a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s.,!?¿¡()":;-]|(.)\1{3,}/.test(sentence)
  };

  // Contar cuántas verificaciones pasa
  const passedChecks = Object.values(checks).filter(check => check).length;
  const totalChecks = Object.keys(checks).length;
  
  // Considerar correcta si pasa al menos 70% de las verificaciones
  return (passedChecks / totalChecks) >= 0.7;
}

/**
 * Calcula el porcentaje de oraciones gramaticalmente correctas
 * @param {string[]} texts - Array de textos
 * @returns {Object} - Resultado del análisis
 */
function calculateGrammaticalCorrectness(texts) {
  if (!texts || texts.length === 0) {
    return {
      totalSentences: 0,
      correctSentences: 0,
      incorrectSentences: 0,
      percentage: 0,
      examples: { correct: [], incorrect: [] }
    };
  }

  const allSentences = [];
  const correctSentences = [];
  const incorrectSentences = [];

  // Extraer todas las oraciones de todos los textos
  texts.forEach(text => {
    const sentences = extractSentences(text);
    sentences.forEach(sentence => {
      allSentences.push(sentence);
      if (isGrammaticallyCorrect(sentence)) {
        correctSentences.push(sentence);
      } else {
        incorrectSentences.push(sentence);
      }
    });
  });

  const totalSentences = allSentences.length;
  const correctCount = correctSentences.length;
  const incorrectCount = incorrectSentences.length;
  const percentage = totalSentences > 0 ? Math.round((correctCount / totalSentences) * 100) : 0;

  return {
    totalSentences,
    correctSentences: correctCount,
    incorrectSentences: incorrectCount,
    percentage,
    examples: {
      correct: correctSentences.slice(0, 5), // Primeras 5 como ejemplo
      incorrect: incorrectSentences.slice(0, 5) // Primeras 5 como ejemplo
    }
  };
}

/**
 * Tokeniza texto y cuenta palabras únicas
 * @param {string} text - Texto a analizar
 * @returns {Object} - Tokens y tipos
 */
function tokenizeText(text) {
  // Limpiar y normalizar el texto
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Tokenizar por espacios
  const tokens = cleanText
    .split(/\s+/)
    .filter(token => token.length > 1) // Filtrar palabras de una sola letra
    .filter(token => !/^\d+$/.test(token)); // Filtrar números puros

  // Contar tipos únicos
  const types = [...new Set(tokens)];

  return { tokens, types };
}

/**
 * Calcula la riqueza léxica (TTR - Type-Token Ratio)
 * @param {string[]} texts - Array de textos
 * @returns {Object} - Resultado del análisis
 */
function calculateLexicalRichness(texts) {
  if (!texts || texts.length === 0) {
    return {
      totalTokens: 0,
      uniqueTypes: 0,
      ttr: 0,
      averageTTR: 0,
      textAnalysis: [],
      vocabulary: []
    };
  }

  let totalTokens = 0;
  let totalTypes = 0;
  const allTokens = [];
  const textAnalysis = [];

  // Analizar cada texto individualmente
  texts.forEach((text, index) => {
    const { tokens, types } = tokenizeText(text);
    
    const ttr = tokens.length > 0 ? Math.round((types.length / tokens.length) * 100) / 100 : 0;
    
    textAnalysis.push({
      textIndex: index + 1,
      preview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      tokens: tokens.length,
      types: types.length,
      ttr: ttr
    });

    totalTokens += tokens.length;
    allTokens.push(...tokens);
  });

  // Calcular métricas globales
  const allUniqueTypes = [...new Set(allTokens)];
  totalTypes = allUniqueTypes.length;
  const globalTTR = totalTokens > 0 ? Math.round((totalTypes / totalTokens) * 100) / 100 : 0;

  // Calcular TTR promedio de todos los textos
  const validTTRs = textAnalysis.filter(analysis => analysis.ttr > 0).map(analysis => analysis.ttr);
  const averageTTR = validTTRs.length > 0 ? 
    Math.round((validTTRs.reduce((sum, ttr) => sum + ttr, 0) / validTTRs.length) * 100) / 100 : 0;

  // Extraer vocabulario más frecuente
  const tokenFrequency = {};
  allTokens.forEach(token => {
    tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
  });

  const vocabulary = Object.entries(tokenFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word, frequency]) => ({ word, frequency }));

  return {
    totalTokens,
    uniqueTypes: totalTypes,
    ttr: globalTTR,
    averageTTR,
    textAnalysis,
    vocabulary
  };
}

/**
 * Analiza las métricas semánticas completas de un recurso
 * @param {Object} recurso - Recurso educativo
 * @returns {Object} - Análisis completo
 */
function analyzeResourceSemantics(recurso) {
  console.log(`Analizando métricas semánticas para recurso: ${recurso.titulo}`);
  
  try {
    // Extraer textos del recurso
    const texts = extractTextFromResource(recurso);
    
    if (texts.length === 0) {
      return {
        error: 'No se encontró contenido textual para analizar',
        resourceInfo: {
          id: recurso.id,
          titulo: recurso.titulo,
          tipo: recurso.tipo
        }
      };
    }

    // Calcular métricas
    const grammaticalAnalysis = calculateGrammaticalCorrectness(texts);
    const lexicalAnalysis = calculateLexicalRichness(texts);

    return {
      resourceInfo: {
        id: recurso.id,
        titulo: recurso.titulo,
        tipo: recurso.tipo,
        createdAt: recurso.createdAt
      },
      textExtraction: {
        totalTexts: texts.length,
        textPreviews: texts.slice(0, 3).map(text => 
          text.substring(0, 100) + (text.length > 100 ? '...' : '')
        )
      },
      grammaticalCorrectness: grammaticalAnalysis,
      lexicalRichness: lexicalAnalysis,
      overallQuality: {
        grammaticalScore: grammaticalAnalysis.percentage,
        lexicalScore: Math.round(lexicalAnalysis.averageTTR * 100),
        combinedScore: Math.round((
          (grammaticalAnalysis.percentage / 100 * 0.6) + 
          (lexicalAnalysis.averageTTR * 0.4)
        ) * 100),
        qualityLevel: getQualityLevel(grammaticalAnalysis.percentage, lexicalAnalysis.averageTTR)
      }
    };
  } catch (error) {
    console.error('Error analizando métricas semánticas:', error);
    return {
      error: 'Error al analizar el recurso: ' + error.message,
      resourceInfo: {
        id: recurso.id,
        titulo: recurso.titulo,
        tipo: recurso.tipo
      }
    };
  }
}

/**
 * Analiza métricas de múltiples recursos
 * @param {Object[]} recursos - Array de recursos
 * @returns {Object} - Análisis agregado
 */
function analyzeBatchResourcesSemantics(recursos) {
  console.log(`Analizando métricas semánticas de ${recursos.length} recursos`);
  
  if (!recursos || recursos.length === 0) {
    return {
      error: 'No se proporcionaron recursos para analizar',
      summary: {
        totalResources: 0,
        averageGrammaticalCorrectness: 0,
        averageLexicalRichness: 0
      }
    };
  }

  const individualAnalyses = [];
  const aggregatedMetrics = {
    totalTexts: 0,
    totalSentences: 0,
    totalCorrectSentences: 0,
    totalTokens: 0,
    totalTypes: 0,
    ttrValues: [],
    grammaticalPercentages: []
  };

  // Analizar cada recurso
  recursos.forEach(recurso => {
    const analysis = analyzeResourceSemantics(recurso);
    
    if (!analysis.error) {
      individualAnalyses.push(analysis);
      
      // Agregar a métricas globales
      aggregatedMetrics.totalTexts += analysis.textExtraction.totalTexts;
      aggregatedMetrics.totalSentences += analysis.grammaticalCorrectness.totalSentences;
      aggregatedMetrics.totalCorrectSentences += analysis.grammaticalCorrectness.correctSentences;
      aggregatedMetrics.totalTokens += analysis.lexicalRichness.totalTokens;
      aggregatedMetrics.totalTypes += analysis.lexicalRichness.uniqueTypes;
      
      if (analysis.grammaticalCorrectness.percentage > 0) {
        aggregatedMetrics.grammaticalPercentages.push(analysis.grammaticalCorrectness.percentage);
      }
      
      if (analysis.lexicalRichness.averageTTR > 0) {
        aggregatedMetrics.ttrValues.push(analysis.lexicalRichness.averageTTR);
      }
    }
  });

  // Calcular promedios
  const avgGrammatical = aggregatedMetrics.grammaticalPercentages.length > 0 ? 
    Math.round(aggregatedMetrics.grammaticalPercentages.reduce((a, b) => a + b, 0) / aggregatedMetrics.grammaticalPercentages.length) : 0;
  
  const avgLexical = aggregatedMetrics.ttrValues.length > 0 ?
    Math.round((aggregatedMetrics.ttrValues.reduce((a, b) => a + b, 0) / aggregatedMetrics.ttrValues.length) * 100) / 100 : 0;

  const globalTTR = aggregatedMetrics.totalTokens > 0 ? 
    Math.round((aggregatedMetrics.totalTypes / aggregatedMetrics.totalTokens) * 100) / 100 : 0;

  return {
    summary: {
      totalResources: recursos.length,
      analyzedResources: individualAnalyses.length,
      failedAnalyses: recursos.length - individualAnalyses.length,
      averageGrammaticalCorrectness: avgGrammatical,
      averageLexicalRichness: avgLexical,
      globalTTR: globalTTR,
      overallQuality: getQualityLevel(avgGrammatical, avgLexical)
    },
    aggregatedMetrics: {
      totalTexts: aggregatedMetrics.totalTexts,
      totalSentences: aggregatedMetrics.totalSentences,
      totalCorrectSentences: aggregatedMetrics.totalCorrectSentences,
      globalGrammaticalPercentage: aggregatedMetrics.totalSentences > 0 ? 
        Math.round((aggregatedMetrics.totalCorrectSentences / aggregatedMetrics.totalSentences) * 100) : 0,
      totalTokens: aggregatedMetrics.totalTokens,
      totalUniqueTypes: aggregatedMetrics.totalTypes,
      globalTTR: globalTTR
    },
    individualAnalyses: individualAnalyses.slice(0, 10), // Limitar para no sobrecargar la respuesta
    resourceTypes: getResourceTypeBreakdown(individualAnalyses)
  };
}

/**
 * Determina el nivel de calidad basado en las métricas
 * @param {number} grammaticalScore - Porcentaje de corrección gramatical
 * @param {number} lexicalScore - TTR promedio
 * @returns {string} - Nivel de calidad
 */
function getQualityLevel(grammaticalScore, lexicalScore) {
  const normalizedLexical = lexicalScore * 100; // Convertir TTR a porcentaje
  const combinedScore = (grammaticalScore * 0.6) + (normalizedLexical * 0.4);
  
  if (combinedScore >= 80) return 'Excelente';
  if (combinedScore >= 70) return 'Bueno';
  if (combinedScore >= 60) return 'Regular';
  if (combinedScore >= 50) return 'Mejorable';
  return 'Necesita mejora';
}

/**
 * Analiza la distribución por tipos de recursos
 * @param {Object[]} analyses - Análisis individuales
 * @returns {Object} - Breakdown por tipo
 */
function getResourceTypeBreakdown(analyses) {
  const typeStats = {};
  
  analyses.forEach(analysis => {
    const tipo = analysis.resourceInfo.tipo;
    if (!typeStats[tipo]) {
      typeStats[tipo] = {
        count: 0,
        avgGrammatical: 0,
        avgLexical: 0,
        grammaticalScores: [],
        lexicalScores: []
      };
    }
    
    typeStats[tipo].count++;
    typeStats[tipo].grammaticalScores.push(analysis.grammaticalCorrectness.percentage);
    typeStats[tipo].lexicalScores.push(analysis.lexicalRichness.averageTTR);
  });
  
  // Calcular promedios por tipo
  Object.keys(typeStats).forEach(tipo => {
    const stats = typeStats[tipo];
    stats.avgGrammatical = stats.grammaticalScores.length > 0 ? 
      Math.round(stats.grammaticalScores.reduce((a, b) => a + b, 0) / stats.grammaticalScores.length) : 0;
    stats.avgLexical = stats.lexicalScores.length > 0 ?
      Math.round((stats.lexicalScores.reduce((a, b) => a + b, 0) / stats.lexicalScores.length) * 100) / 100 : 0;
    
    // Limpiar arrays temporales
    delete stats.grammaticalScores;
    delete stats.lexicalScores;
  });
  
  return typeStats;
}

export {
  analyzeResourceSemantics,
  analyzeBatchResourcesSemantics,
  extractTextFromResource,
  extractSentences,
  isGrammaticallyCorrect,
  calculateLexicalRichness
};
