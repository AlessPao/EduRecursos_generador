import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testSimpleAnalysis() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // Obtener usuarios disponibles
    console.log('👥 Obteniendo usuarios disponibles...');
    const usersResponse = await axios.get(`${API_BASE}/simple-analysis/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (usersResponse.data.success) {
      const users = usersResponse.data.data.users;
      console.log(`✅ ${users.length} usuarios encontrados:`);
      users.forEach(user => {
        console.log(`   • ${user.nombre} (ID: ${user.id}) - ${user.totalResources} recursos`);
      });

      // Analizar el primer usuario con más recursos
      if (users.length > 0) {
        const targetUser = users.reduce((prev, current) => 
          (prev.totalResources > current.totalResources) ? prev : current
        );

        console.log(`\n📊 Analizando usuario: ${targetUser.nombre} (${targetUser.totalResources} recursos)...`);
        
        const analysisResponse = await axios.get(`${API_BASE}/simple-analysis/user/${targetUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (analysisResponse.data.success) {
          const data = analysisResponse.data.data;
          console.log('\n✅ ANÁLISIS COMPLETADO:');
          console.log('=' .repeat(50));
          console.log(`👤 Usuario: ${data.user}`);
          console.log(`📚 Total recursos analizados: ${data.totalResources}`);
          console.log(`📝 Corrección gramatical promedio: ${data.metrics.averageGrammar}%`);
          console.log(`📖 TTR (riqueza léxica) promedio: ${data.metrics.averageTTR}`);
          console.log(`🏆 Calidad general: ${data.metrics.overallQuality}`);
          console.log('\n📊 Distribución de calidad:');
          console.log(`   ⭐ Excelente: ${data.breakdown.excellent} recursos`);
          console.log(`   ✅ Buena: ${data.breakdown.good} recursos`);
          console.log(`   ⚠️ Regular: ${data.breakdown.regular} recursos`);
          console.log(`   ❌ Deficiente: ${data.breakdown.poor} recursos`);
          console.log('=' .repeat(50));
        }

        // Analizar otro usuario si existe
        if (users.length > 1) {
          const secondUser = users.find(u => u.id !== targetUser.id);
          console.log(`\n📊 Analizando segundo usuario: ${secondUser.nombre}...`);
          
          const secondAnalysisResponse = await axios.get(`${API_BASE}/simple-analysis/user/${secondUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (secondAnalysisResponse.data.success) {
            const data = secondAnalysisResponse.data.data;
            console.log(`\n✅ Segundo análisis: ${data.user}`);
            console.log(`   📚 Recursos: ${data.totalResources}`);
            console.log(`   📝 Gramática: ${data.metrics.averageGrammar}%`);
            console.log(`   📖 TTR: ${data.metrics.averageTTR}`);
            console.log(`   🏆 Calidad: ${data.metrics.overallQuality}`);
          }
        }
      }
    }

    console.log('\n🎯 ENDPOINTS DISPONIBLES:');
    console.log(`   • Listar usuarios: GET ${API_BASE}/simple-analysis/users`);
    console.log(`   • Analizar usuario: GET ${API_BASE}/simple-analysis/user/{userId}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data?.error) {
      console.error('   Detalle:', error.response.data.error);
    }
  }
}

console.log('🚀 INICIANDO ANÁLISIS SIMPLE POR USUARIO');
console.log('=' .repeat(50));
testSimpleAnalysis();
