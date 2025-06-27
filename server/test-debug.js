import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function simpleTest() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // Ver estructura de respuesta de recursos
    console.log('\n🔍 Obteniendo recursos...');
    const recursosResponse = await axios.get(`${API_BASE}/recursos`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Respuesta completa:', JSON.stringify(recursosResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

simpleTest();
