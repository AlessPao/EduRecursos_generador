import fetch from 'node-fetch';

async function testUserEndpoint() {
  try {
    console.log('🔍 TESTING ENDPOINT DIRECTO');
    console.log('==========================\n');

    // Login para obtener token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'paolo@gmail.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login exitoso');

    // Llamar al endpoint de análisis de usuario con debug
    const userId = 1; // Paolo
    console.log(`📊 Llamando endpoint: /api/simple-analysis/user/${userId}`);
    
    const userAnalysisResponse = await fetch(`http://localhost:5000/api/simple-analysis/user/${userId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userAnalysisResponse.ok) {
      const errorText = await userAnalysisResponse.text();
      throw new Error(`User analysis failed: ${userAnalysisResponse.status} - ${errorText}`);
    }

    const analysisData = await userAnalysisResponse.json();
    
    console.log('\n📋 RESPUESTA COMPLETA DEL ENDPOINT:');
    console.log('===================================');
    console.log(JSON.stringify(analysisData, null, 2));

    if (analysisData.success && analysisData.data) {
      const data = analysisData.data;
      console.log('\n📊 MÉTRICAS EXTRAÍDAS:');
      console.log('======================');
      console.log(`👤 Usuario: ${data.user}`);
      console.log(`📚 Recursos: ${data.totalResources}`);
      console.log(`📝 Gramática: ${data.metrics.averageGrammar}%`);
      console.log(`📖 TTR: ${data.metrics.averageTTR}`);
      console.log(`🏆 Calidad: ${data.metrics.overallQuality}`);
      
      if (data.debug) {
        console.log('\n🔧 DEBUG INFO:');
        console.log('==============');
        console.log(JSON.stringify(data.debug, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUserEndpoint();
