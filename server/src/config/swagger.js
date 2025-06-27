import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Recursos Educativos API',
      version: '1.0.0',
      description: 'API para gestión de recursos educativos y exámenes',
      contact: {
        name: 'Sistema Educativo',
        email: 'admin@sistemaducativo.com'
      }
    },    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? `${process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL}/api`
          : 'http://localhost:5000/api',
        description: process.env.NODE_ENV === 'production' 
          ? 'Servidor de Producción (Render)'
          : 'Servidor de Desarrollo'
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor Local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['nombre', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario',
              minLength: 3,
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario',
              minLength: 8
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Recurso: {
          type: 'object',
          required: ['titulo', 'tipo'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del recurso'
            },
            titulo: {
              type: 'string',
              description: 'Título del recurso'
            },
            tipo: {
              type: 'string',
              enum: ['comprension', 'escritura', 'gramatica', 'oral', 'drag_and_drop', 'ice_breakers'],
              description: 'Tipo de recurso educativo'
            },
            contenido: {
              type: 'object',
              description: 'Contenido del recurso en formato JSON'
            },
            usuarioId: {
              type: 'integer',
              description: 'ID del usuario creador'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Exam: {
          type: 'object',
          required: ['titulo', 'tema'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del examen'
            },
            slug: {
              type: 'string',
              description: 'Slug único del examen para URLs'
            },
            titulo: {
              type: 'string',
              description: 'Título del examen'
            },
            texto: {
              type: 'string',
              description: 'Texto base del examen'
            },
            preguntas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pregunta: { type: 'string' },
                  opciones: { 
                    type: 'array',
                    items: { type: 'string' }
                  },
                  respuesta: { type: 'string' }
                }
              }
            },
            usuarioId: {
              type: 'integer',
              description: 'ID del usuario creador'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensaje de error'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Detalles de errores de validación'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Mensaje de éxito'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);
export default specs;