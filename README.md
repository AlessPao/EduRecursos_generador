# Sistema de Recursos Educativos para 2° Grado

Este proyecto es una herramienta fullstack para generar recursos educativos destinados a docentes de 2° grado de primaria, utilizando un modelo LLM para crear contenido alineado con el currículo nacional.

## Características principales

- **Autenticación**: Registro de usuarios e inicio de sesión.
- **Generación de recursos**: Creación de fichas de comprensión lectora, actividades de producción escrita, ejercicios de gramática/ortografía y guiones para comunicación oral.
- **Gestión de recursos**: Listado, vista previa, edición, eliminación y descarga en PDF.
- **Integración con IA**: Utiliza el modelo microsoft/phi-4-reasoning-plus mediante OpenRouter para generar recursos educativos de calidad.

## Tecnologías

### Frontend
- React + TypeScript
- React Router para navegación
- Tailwind CSS para estilos
- React Hook Form para manejo de formularios
- Framer Motion para animaciones
- Axios para peticiones HTTP

### Backend
- Node.js + Express
- PostgreSQL como base de datos
- Sequelize como ORM
- Express Session para manejo de sesiones
- Bcrypt para cifrado de contraseñas
- HTML-PDF para generación de PDFs

## Estructura del proyecto

```
/client            # Frontend React
  ├ /public        # Archivos públicos
  └ /src           # Código fuente
    ├ /components  # Componentes reutilizables
    ├ /context     # Contextos (Auth)
    ├ /pages       # Páginas de la aplicación
    ├ /utils       # Utilidades
    └ /config      # Configuración

/server            # Backend Node.js
  └ /src           # Código fuente
    ├ /config      # Configuración
    ├ /controllers # Controladores
    ├ /middleware  # Middleware
    ├ /models      # Modelos de base de datos
    ├ /routes      # Rutas API
    └ /services    # Servicios (LLM)
```

## Configuración e instalación

### Requisitos previos
- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)

### Pasos de instalación

1. Clonar el repositorio:
   ```
   git clone <URL_REPO>
   cd sistema-recursos-educativos
   ```

2. Instalar dependencias (raíz, cliente y servidor):
   ```
   npm run setup
   ```

3. Configurar las variables de entorno:
   - Crear archivo `.env` en la carpeta `/server` con las siguientes variables:
   ```
   db_url=postgres://usuario:contraseña@localhost:5432/bdrecursos
   offenrouter_api_key=tu_clave_api
   llm_model=microsoft/phi-4-reasoning-plus:free
   llm_base_url=https://openrouter.ai/api/v1
   PORT=5000
   SESSION_SECRET=secreto_para_sesiones
   ```

4. Crear la base de datos en PostgreSQL:
   ```
   createdb bdrecursos
   ```

5. Iniciar la aplicación en modo desarrollo:
   ```
   npm run dev
   ```

### Scripts disponibles

- `npm run dev`: Inicia cliente y servidor en modo desarrollo
- `npm run dev:client`: Inicia solo el cliente 
- `npm run dev:server`: Inicia solo el servidornpm
- `npm run build:client`: Compila el cliente para producción
- `npm run start`: Inicia la aplicación en modo producción

## Uso

1. Acceder a la aplicación desde el navegador: `http://localhost:5173`
2. Registrarse o iniciar sesión
3. Desde el dashboard, seleccionar el tipo de recurso a generar
4. Completar el formulario con las opciones deseadas
5. Generar el recurso, previsualizarlo y descargarlo o editarlo
