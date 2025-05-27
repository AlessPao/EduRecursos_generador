import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar configuración y modelos
import { sequelize } from './models/db.js';
import './models/associations.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import recursosRoutes from './routes/recursos.routes.js';
// Importar rutas de exámenes
import examsRoutes from './routes/exams.routes.js';

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman) o si está en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/recursos', recursosRoutes);
// Montar rutas de exámenes
app.use('/api/exams', examsRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor ejecutándose en http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();