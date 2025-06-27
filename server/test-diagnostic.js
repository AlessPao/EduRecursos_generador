import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function diagnosticAnalysis() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // Obtener algunos recursos para ver su contenido
    console.log('🔍 Revisando contenido de recursos...');
    const recursosResponse = await axios.get(`${API_BASE}/recursos`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (recursosResponse.data.success && recursosResponse.data.data.length > 0) {
      const recursos = recursosResponse.data.data.slice(0, 3); // Solo los primeros 3
      
      recursos.forEach((recurso, index) => {
        console.log(`\n📄 Recurso ${index + 1}:`);
        console.log(`   ID: ${recurso.id}`);
        console.log(`   Título: ${recurso.titulo}`);
        console.log(`   Tipo: ${recurso.tipo}`);
        console.log(`   Contenido (estructura):`, Object.keys(recurso.contenido || {}));
        
        // Mostrar una muestra del contenido
        if (recurso.contenido) {
          console.log(`   Contenido (muestra):`, JSON.stringify(recurso.contenido).substring(0, 200) + '...');
        }
      });

      // Probar análisis individual de un recurso
      console.log(`\n🧪 Probando análisis individual del recurso ${recursos[0].id}...`);
      const analysisResponse = await axios.get(`${API_BASE}/semantics/resource/${recursos[0].id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (analysisResponse.data.success) {
        console.log('✅ Análisis individual exitoso:');
        console.log('   Resultado:', JSON.stringify(analysisResponse.data.data, null, 2));
      } else {
        console.log('❌ Error en análisis individual:', analysisResponse.data.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

console.log('🔬 DIAGNÓSTICO DE ANÁLISIS');
console.log('=' .repeat(40));
diagnosticAnalysis();
