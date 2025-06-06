import { validationResult } from 'express-validator';
import Recurso from '../models/Recurso.js';
import { generarRecurso } from '../services/llm.service.js';
import pdf from 'html-pdf';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener todos los recursos del usuario
export const getRecursos = async (req, res, next) => {
  try {
    const recursos = await Recurso.findAll({
      where: { usuarioId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: recursos.length,
      recursos
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un recurso por ID
export const getRecursoById = async (req, res, next) => {
  try {
    const recurso = await Recurso.findOne({
      where: { 
        id: req.params.id,
        usuarioId: req.user.userId
      }
    });
    
    if (!recurso) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      recurso
    });
  } catch (error) {
    next(error);
  }
};

// Generar nuevo recurso
export const createRecurso = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { tipo, titulo, opciones } = req.body;

    // Generar contenido con LLM
    const start = Date.now();
    const contenidoGenerado = await generarRecurso({ tipo, opciones });
    const end = Date.now();
    const tiempoGeneracionSegundos = (end - start) / 1000;

    // Guardar recurso en base de datos
    const recurso = await Recurso.create({
      usuarioId: req.user.userId,
      tipo,
      titulo,
      contenido: contenidoGenerado,
      meta: { opciones },
      tiempoGeneracionSegundos
    });
    
    res.status(201).json({
      success: true,
      message: 'Recurso generado y guardado correctamente',
      recurso
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar recurso
export const updateRecurso = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { titulo, contenido } = req.body;
    
    // Verificar que el recurso existe y pertenece al usuario
    const recurso = await Recurso.findOne({
      where: { 
        id: req.params.id,
        usuarioId: req.user.userId
      }
    });
    
    if (!recurso) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }
    
    // Actualizar recurso
    await recurso.update({
      titulo: titulo || recurso.titulo,
      contenido: contenido || recurso.contenido
    });
    
    res.status(200).json({
      success: true,
      message: 'Recurso actualizado correctamente',
      recurso
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar recurso
export const deleteRecurso = async (req, res, next) => {
  try {
    // Verificar que el recurso existe y pertenece al usuario
    const recurso = await Recurso.findOne({
      where: { 
        id: req.params.id,
        usuarioId: req.user.userId
      }
    });
    
    if (!recurso) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }
    
    // Eliminar recurso
    await recurso.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Recurso eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

// Generar PDF del recurso
export const generatePdf = async (req, res, next) => {
  try {
    const recurso = await Recurso.findOne({
      where: { 
        id: req.params.id,
        usuarioId: req.user.userId
      }
    });
    
    if (!recurso) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }
    
    // Generar HTML según el tipo de recurso
    const html = generateHtmlTemplate(recurso);
    
    // Configuración para la generación del PDF
    const options = {
      format: 'A4',
      border: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      },
      header: {
        height: '1cm'
      },
      footer: {
        height: '1cm',
        contents: {
          default: '<span style="font-size: 10px; text-align: center; width: 100%; display: block">Página {{page}} de {{pages}}</span>'
        }
      }
    };
    
    // Generar PDF
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        return next(err);
      }
      
      // Enviar PDF al cliente
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${recurso.titulo.replace(/\s+/g, '_')}.pdf"`);
      res.send(buffer);
    });
  } catch (error) {
    next(error);
  }
};

// Función auxiliar para generar el HTML del PDF según el tipo de recurso
function generateHtmlTemplate(recurso) {
  const { tipo, titulo, contenido } = recurso;
  
  // Estilos comunes para todos los tipos de recursos
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      h1 { color: #2563eb; text-align: center; margin-bottom: 20px; }
      h2 { color: #4b5563; margin-top: 20px; }
      .container { max-width: 800px; margin: 0 auto; padding: 20px; }
      .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
      .question { background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin-bottom: 10px; }
      .answer { color: #4b5563; padding-left: 20px; }
      .word { font-weight: bold; color: #2563eb; }
      .definition { padding-left: 20px; margin-bottom: 10px; }
      .item { margin-bottom: 10px; }
      ul, ol { padding-left: 20px; }
      .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
    </style>
  `;
  
  let htmlContent = '';
  
  // Generar contenido HTML según el tipo de recurso
  switch (tipo) {
    case 'comprension':
      htmlContent = `
        <div class="container">
          <h1>${titulo}</h1>
          <div class="box">
            <p>${contenido.texto}</p>
          </div>
          
          <h2>Preguntas</h2>
          <div class="box">
            ${contenido.preguntas.map((item, index) => `
              <div class="question">
                <p><strong>${index + 1}. ${item.pregunta}</strong></p>
                <p class="answer">${item.respuesta}</p>
              </div>
            `).join('')}
          </div>
          
          ${contenido.vocabulario ? `
            <h2>Vocabulario</h2>
            <div class="box">
              ${contenido.vocabulario.map(item => `
                <div class="item">
                  <span class="word">${item.palabra}:</span>
                  <div class="definition">${item.definicion}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
      break;
      
    case 'escritura':
      htmlContent = `
        <div class="container">
          <h1>${titulo}</h1>
          <div class="box">
            <p>${contenido.descripcion}</p>
          </div>
          
          <h2>Instrucciones</h2>
          <div class="box">
            <p>${contenido.instrucciones}</p>
          </div>
          
          <h2>Estructura Propuesta</h2>
          <div class="box">
            <p>${contenido.estructuraPropuesta}</p>
          </div>
          
          ${contenido.conectores ? `
            <h2>Conectores Útiles</h2>
            <div class="box">
              <ul>
                ${contenido.conectores.map(conector => `<li>${conector}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <h2>Lista de Verificación</h2>
          <div class="box">
            <ol>
              ${contenido.listaVerificacion.map(item => `<li>${item}</li>`).join('')}
            </ol>
          </div>
        </div>
      `;
      break;
      
    case 'gramatica':
      htmlContent = `
        <div class="container">
          <h1>${titulo}</h1>
          <div class="box">
            <p><strong>Instrucciones:</strong> ${contenido.instrucciones}</p>
          </div>
          
          <h2>Ejemplo</h2>
          <div class="box">
            <p>${contenido.ejemplo}</p>
          </div>
          
          <h2>Ejercicios</h2>
          <div class="box">
            ${contenido.items.map((item, index) => `
              <div class="item">
                <p><strong>${index + 1}. ${item.consigna}</strong></p>
                <p class="answer">Respuesta: ${item.respuesta}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      break;
      
    case 'oral':
      htmlContent = `
        <div class="container">
          <h1>${titulo}</h1>
          <div class="box">
            <p>${contenido.descripcion}</p>
          </div>
          
          <h2>Instrucciones para el Docente</h2>
          <div class="box">
            <p>${contenido.instruccionesDocente}</p>
          </div>
          
          <h2>Guión para Estudiantes</h2>
          <div class="box">
            <p>${contenido.guionEstudiante}</p>
          </div>
          
          <h2>Preguntas Orientadoras</h2>
          <div class="box">
            <ol>
              ${contenido.preguntasOrientadoras.map(pregunta => `<li>${pregunta}</li>`).join('')}
            </ol>
          </div>
          
          <h2>Criterios de Evaluación</h2>
          <div class="box">
            <ul>
              ${contenido.criteriosEvaluacion.map(criterio => `<li>${criterio}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      break;

    case 'ice_breakers':
      htmlContent = `
        <div class="container">
          <h1>${titulo}</h1>
          <div class="box">
            <p><strong>Descripción:</strong> ${contenido.descripcion}</p>
          </div>
          
          <h2>Objetivos</h2>
          <div class="box">
            <ul>
              ${contenido.objetivos ? contenido.objetivos.map(objetivo => `<li>${objetivo}</li>`).join('') : '<li>Desarrollo de habilidades comunicativas</li>'}
            </ul>
          </div>
          
          ${contenido.actividades.map((actividad, index) => `
            <h2>Actividad ${index + 1}: ${actividad.nombre}</h2>
            <div class="box">
              <p><strong>Duración:</strong> ${actividad.duracionMinutos} minutos</p>
              <p><strong>Participantes:</strong> ${actividad.participantes}</p>
              
              <h3>Instrucciones para el Docente</h3>
              <p>${actividad.instrucciones}</p>
              
              <h3>Desarrollo</h3>
              <p>${actividad.desarrollo}</p>
              
              ${actividad.materiales ? `
                <h3>Materiales</h3>
                <ul>
                  ${actividad.materiales.map(material => `<li>${material}</li>`).join('')}
                </ul>
              ` : ''}
              
              ${actividad.contenidoEspecifico ? `
                <h3>Contenido Específico</h3>
                <div class="box">
                  ${actividad.contenidoEspecifico.pistas ? `
                    <h4>Pistas:</h4>
                    <ol>
                      ${actividad.contenidoEspecifico.pistas.map(pista => `<li>${pista.pista}</li>`).join('')}
                    </ol>
                    <p><strong>Respuesta:</strong> ${actividad.contenidoEspecifico.respuesta}</p>
                  ` : ''}
                  
                  ${actividad.contenidoEspecifico.descripcion ? `
                    <h4>Descripción para dibujar:</h4>
                    <p>${actividad.contenidoEspecifico.descripcion}</p>
                    <h4>Elementos clave:</h4>
                    <ul>
                      ${actividad.contenidoEspecifico.elementosClave ? actividad.contenidoEspecifico.elementosClave.map(elemento => `<li>${elemento}</li>`).join('') : ''}
                    </ul>
                  ` : ''}
                  
                  ${actividad.contenidoEspecifico.frases ? `
                    <h4>Plantillas de frases:</h4>
                    ${actividad.contenidoEspecifico.frases.map(frase => `
                      <p><strong>${frase.template}</strong></p>
                      <p>Ejemplos: ${frase.ejemplos.join(', ')}</p>
                    `).join('')}
                  ` : ''}
                  
                  ${actividad.contenidoEspecifico.desafios ? `
                    <h4>Desafíos de búsqueda:</h4>
                    <ul>
                      ${actividad.contenidoEspecifico.desafios.map(desafio => `
                        <li><strong>Encuentra algo que ${desafio.criterio}</strong><br>
                        Ejemplos: ${desafio.ejemplos.join(', ')}</li>
                      `).join('')}
                    </ul>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
          
          ${contenido.variaciones ? `
            <h2>Variaciones</h2>
            <div class="box">
              <ul>
                ${contenido.variaciones.map(variacion => `<li>${variacion}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
      break;
      
    default:
      htmlContent = `
        <div class="container">
          <h1>${titulo}</h1>
          <div class="box">
            <pre>${JSON.stringify(contenido, null, 2)}</pre>
          </div>
        </div>
      `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${titulo}</title>
        ${styles}
      </head>
      <body>
        ${htmlContent}
        <div class="footer">
          <p>Generado con Sistema de Recursos Educativos para 2° Grado</p>
        </div>
      </body>
    </html>
  `;
}