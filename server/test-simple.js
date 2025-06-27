import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testUserAnalysis() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // Obtener usuarios disponibles
    console.log('\n👥 Usuarios disponibles:');
    const usersResponse = await axios.get(`${API_BASE}/semantics/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    usersResponse.data.data.users.forEach(user => {
      console.log(`   • ${user.nombre} (ID: ${user.id}) - ${user.totalResources} recursos`);
    });

    // Analizar usuario específico (Paolo que tiene más recursos)
    console.log('\n📊 Analizando usuario Paolo (ID: 1)...');
    const userAnalysis = await axios.get(`${API_BASE}/semantics/user/1/report`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (userAnalysis.data.success) {
      const data = userAnalysis.data.data;
      console.log('✅ Análisis completado:');
      console.log(`   👤 Usuario: ${data.user}`);
      console.log(`   📚 Total recursos: ${data.totalResources}`);
      console.log(`   📝 Gramática promedio: ${data.metrics.averageGrammar}%`);
      console.log(`   📖 TTR promedio: ${data.metrics.averageTTR}`);
      console.log(`   🏆 Calidad general: ${data.metrics.overallQuality}`);
      console.log(`   📊 Distribución de calidad:`);
      console.log(`      ⭐ Excelente: ${data.breakdown.excellent} recursos`);
      console.log(`      ✅ Buena: ${data.breakdown.good} recursos`);
      console.log(`      ⚠️ Regular: ${data.breakdown.regular} recursos`);
      console.log(`      ❌ Deficiente: ${data.breakdown.poor} recursos`);
    }

    // Analizar otro usuario
    console.log('\n📊 Analizando usuario Test User (ID: 8)...');
    const userAnalysis2 = await axios.get(`${API_BASE}/semantics/user/8/report`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (userAnalysis2.data.success) {
      const data = userAnalysis2.data.data;
      console.log('✅ Análisis completado:');
      console.log(`   👤 Usuario: ${data.user}`);
      console.log(`   📚 Total recursos: ${data.totalResources}`);
      console.log(`   📝 Gramática promedio: ${data.metrics.averageGrammar}%`);
      console.log(`   📖 TTR promedio: ${data.metrics.averageTTR}`);
      console.log(`   🏆 Calidad general: ${data.metrics.overallQuality}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testUserAnalysis();
