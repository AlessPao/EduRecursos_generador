import Usuario from './src/models/Usuario.js';
import './src/models/associations.js';

async function checkUsers() {
  try {
    const users = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email'],
      limit: 10
    });
    
    console.log('Usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Nombre: ${user.nombre}, Email: ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers().then(() => process.exit(0));
