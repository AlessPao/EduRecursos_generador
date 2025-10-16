import { Sequelize } from 'sequelize';
import { dbUrl } from '../config/index.js';

export const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  timezone: '-05:00', // Zona horaria de Perú (UTC-5)
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Configurar el timezone de la sesión a America/Lima
sequelize.addHook('beforeConnect', async (config) => {
  // No podemos ejecutar queries en beforeConnect, así que usamos dialectOptions
});

// Hook después de conectar para establecer el timezone
sequelize.addHook('afterConnect', async (connection) => {
  try {
    await connection.query("SET TIME ZONE 'America/Lima';");
  } catch (error) {
    console.error('Error setting timezone:', error);
  }
});

// Probar conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
};