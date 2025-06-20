# 📚 API Documentation - Sistema de Recursos Educativos

Este proyecto incluye documentación automática de la API usando **Swagger UI**.

## 🌐 Acceso a la Documentación

### 🖥️ Desarrollo Local
- **URL:** `http://localhost:5000/api-docs`
- **API Base:** `http://localhost:5000/api`

### 🚀 Producción (Render)
- **URL:** `https://tu-app.onrender.com/api-docs`
- **API Base:** `https://tu-app.onrender.com/api`

## 📋 Endpoints Documentados

### 🔐 Autenticación (`/api/auth`)
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/request-password-reset` - Solicitar código de recuperación
- `POST /auth/reset-password` - Resetear contraseña

### 📚 Recursos (`/api/recursos`)
- `GET /recursos` - Listar recursos
- `POST /recursos` - Crear recurso
- `GET /recursos/{id}` - Obtener recurso específico
- `PUT /recursos/{id}` - Actualizar recurso
- `DELETE /recursos/{id}` - Eliminar recurso
- `GET /recursos/{id}/pdf` - Generar PDF

### 📝 Exámenes (`/api/exams`)
- `GET /exams` - Listar exámenes
- `POST /exams` - Crear examen
- `GET /exams/{slug}` - Obtener examen público
- `POST /exams/{slug}/submit` - Enviar respuestas
- `GET /exams/{slug}/results` - Obtener resultados
- `DELETE /exams/{slug}/results` - Eliminar resultados
- `DELETE /exams/{slug}` - Eliminar examen

## 🔑 Autenticación

La mayoría de endpoints requieren autenticación JWT. En Swagger:

1. Hacer login en `/auth/login`
2. Copiar el token de la respuesta
3. Hacer clic en "🔒 Authorize" en Swagger UI
4. Pegar el token con formato: `Bearer YOUR_TOKEN`

## 🏃‍♂️ Cómo Usar

### 1. Iniciar el Servidor
```bash
cd server
npm run dev
```

### 2. Abrir Swagger UI
Navegar a: `http://localhost:5000/api-docs`

### 3. Probar Endpoints
- Expandir cualquier endpoint
- Hacer clic en "Try it out"
- Completar los parámetros
- Hacer clic en "Execute"

## 🎯 Características

✅ **Documentación completa** de todos los endpoints
✅ **Pruebas interactivas** directamente en el navegador
✅ **Esquemas de datos** definidos
✅ **Autenticación JWT** integrada
✅ **Ejemplos de requests/responses**
✅ **Validaciones de parámetros**
✅ **Funciona en desarrollo y producción**

## 🔧 Configuración para Producción

Para Render, asegúrate de que tu variable de entorno `NODE_ENV=production` esté configurada para que la URL del servidor se ajuste automáticamente.

## 📱 Tipos de Recursos Soportados

- `comprension` - Comprensión lectora
- `escritura` - Producción escrita  
- `gramatica` - Gramática y ortografía
- `oral` - Comunicación oral
- `drag_and_drop` - Juegos interactivos
- `ice_breakers` - Actividades rompehielos

## 🧪 Ejemplos de Uso

### Crear un Recurso
```json
{
  "titulo": "Comprensión sobre animales",
  "tipo": "comprension",
  "opciones": {
    "tema": "Animales de la selva",
    "longitud": "200"
  }
}
```

### Crear un Examen
```json
{
  "titulo": "Examen de Comprensión",
  "tema": "Naturaleza",
  "longitud": "200",
  "numLiteral": 5
}
```

¡Disfruta probando tu API! 🚀
