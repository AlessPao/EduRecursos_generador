import axios from 'axios';

// Configuración base
const API_BASE = 'http://localhost:5000/api';
let authToken = '';

// Función para hacer login y obtener token
async function login() {
  try {
    console.log('🔐 Haciendo login...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (response.data.success) {
      authToken = response.data.token;
      console.log('✅ Login exitoso');
      return true;
    }
  } catch (error) {
    console.log('❌ Error en login:', error.response?.data?.message || error.message);
    
    // Si no existe, intentar registrar
    try {
      console.log('📝 Intentando registrar usuario...');
      await axios.post(`${API_BASE}/auth/register`, {
        nombre: 'Usuario Test',
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Intentar login de nuevo
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      
      authToken = loginResponse.data.token;
      console.log('✅ Usuario registrado y login exitoso');
      return true;
    } catch (registerError) {
      console.log('❌ Error en registro:', registerError.response?.data?.message || registerError.message);
      return false;
    }
  }
}

// Función para crear recursos de prueba
async function createTestResources() {
  const headers = { Authorization: `Bearer ${authToken}` };
  
  const testResources = [
    {
      titulo: 'Comprensión sobre Animales',
      tipo: 'comprension',
      opciones: {
        tema: 'Los animales de la granja',
        tipoTexto: 'narrativo',
        longitud: '150',
        numLiteral: 3,
        numInferencial: 2,
        numCritica: 1,
        vocabulario: true
      }
    },
    {
      titulo: 'Escritura Creativa',
      tipo: 'escritura',
      opciones: {
        tema: 'Mi familia',
        nivelAyuda: 'medio',
        conectores: true
      }
    },
    {
      titulo: 'Gramática Básica',
      tipo: 'gramatica',
      opciones: {
        aspecto: 'mayúsculas',
        tipoEjercicio: 'identificar',
        numItems: 5,
        contexto: 'nombres propios'
      }
    }
  ];

  console.log('📚 Creando recursos de prueba...');
  const createdResources = [];

  for (const resource of testResources) {
    try {
      const response = await axios.post(`${API_BASE}/recursos`, resource, { headers });
      if (response.data.success) {
        createdResources.push(response.data.recurso);
        console.log(`✅ Recurso creado: ${resource.titulo} (ID: ${response.data.recurso.id})`);
      }
    } catch (error) {
      console.log(`❌ Error creando ${resource.titulo}:`, error.response?.data?.message || error.message);
    }
  }

  return createdResources;
}

// Función para obtener recursos existentes
async function getExistingResources() {
  try {
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.get(`${API_BASE}/recursos`, { headers });
    
    if (response.data.success) {
      console.log(`📋 Encontrados ${response.data.recursos.length} recursos existentes`);
      return response.data.recursos;
    }
  } catch (error) {
    console.log('❌ Error obteniendo recursos:', error.response?.data?.message || error.message);
    return [];
  }
}

// Función para probar análisis de un recurso específico
async function testSingleResourceAnalysis(resourceId) {
  try {
    console.log(`\n🔍 Analizando recurso ${resourceId}...`);
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.get(`${API_BASE}/semantics/resource/${resourceId}`, { headers });
    
    if (response.data.success) {
      const analysis = response.data.data;
      console.log('✅ Análisis individual completado:');
      console.log(`   📝 Recurso: ${analysis.resourceInfo.titulo}`);
      console.log(`   📊 Corrección gramatical: ${analysis.grammaticalCorrectness.percentage}%`);
      console.log(`   📚 Riqueza léxica (TTR): ${analysis.lexicalRichness.averageTTR}`);
      console.log(`   🏆 Calidad general: ${analysis.overallQuality.qualityLevel}`);
      return analysis;
    }
  } catch (error) {
    console.log(`❌ Error analizando recurso ${resourceId}:`, error.response?.data?.message || error.message);
    return null;
  }
}

// Función para probar análisis en lote
async function testBatchAnalysis() {
  try {
    console.log('\n📊 Ejecutando análisis en lote...');
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.get(`${API_BASE}/semantics/batch?limit=10`, { headers });
    
    if (response.data.success) {
      const analysis = response.data.data;
      console.log('✅ Análisis en lote completado:');
      console.log(`   📈 Recursos analizados: ${analysis.summary.analyzedResources}`);
      console.log(`   📝 Promedio gramática: ${analysis.summary.averageGrammaticalCorrectness}%`);
      console.log(`   📚 Promedio léxico: ${analysis.summary.averageLexicalRichness}`);
      console.log(`   🏆 Calidad general: ${analysis.summary.overallQuality}`);
      
      if (analysis.resourceTypes) {
        console.log('\n   📋 Por tipo de recurso:');
        Object.entries(analysis.resourceTypes).forEach(([tipo, stats]) => {
          console.log(`      ${tipo}: ${stats.count} recursos, ${stats.avgGrammatical}% gramática`);
        });
      }
      
      return analysis;
    }
  } catch (error) {
    console.log('❌ Error en análisis batch:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función para probar reporte completo
async function testFullReport() {
  try {
    console.log('\n📋 Generando reporte completo...');
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.get(`${API_BASE}/semantics/report?incluirEjemplos=true`, { headers });
    
    if (response.data.success) {
      const report = response.data.data;
      console.log('✅ Reporte completo generado:');
      console.log(`   📅 Fecha: ${new Date(report.reportDate).toLocaleDateString()}`);
      console.log(`   📊 Total recursos: ${report.globalSummary.totalResources}`);
      console.log(`   📝 Promedio gramática global: ${report.globalSummary.avgGrammatical}%`);
      console.log(`   📚 TTR global: ${report.globalSummary.globalTTR}`);
      console.log(`   🏆 Calidad general: ${report.globalSummary.overallQuality}`);
      
      if (report.insights && report.insights.length > 0) {
        console.log('\n   💡 Insights:');
        report.insights.forEach(insight => {
          const emoji = insight.type === 'positive' ? '✅' : insight.type === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`      ${emoji} ${insight.message}`);
        });
      }
      
      return report;
    }
  } catch (error) {
    console.log('❌ Error en reporte:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función para probar análisis por usuario
async function testUserAnalysis() {
  try {
    console.log('\n👤 Probando análisis por usuario...');
    
    // Primero, listar usuarios disponibles
    console.log('👥 Obteniendo lista de usuarios...');
    const usersResponse = await axios.get(`${API_BASE}/semantics/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (usersResponse.data.success) {
      console.log(`✅ Usuarios disponibles: ${usersResponse.data.data.totalUsers}`);
      usersResponse.data.data.users.forEach(user => {
        console.log(`   • ${user.nombre} (ID: ${user.id}) - ${user.totalResources} recursos`);
      });
    }
    
    // Probar mis recursos
    console.log('\n📊 Analizando mis recursos...');
    const myReportResponse = await axios.get(`${API_BASE}/semantics/my-report`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (myReportResponse.data.success) {
      const data = myReportResponse.data.data;
      console.log('✅ Mi reporte generado:');
      console.log(`   👤 Usuario: ${data.user}`);
      console.log(`   📚 Total recursos: ${data.totalResources}`);
      console.log(`   📝 Gramática promedio: ${data.metrics.averageGrammar}%`);
      console.log(`   📖 TTR promedio: ${data.metrics.averageTTR}`);
      console.log(`   🏆 Calidad general: ${data.metrics.overallQuality}`);
      console.log(`   📊 Distribución:`);
      console.log(`      ⭐ Excelente: ${data.breakdown.excellent}`);
      console.log(`      ✅ Buena: ${data.breakdown.good}`);
      console.log(`      ⚠️ Regular: ${data.breakdown.regular}`);
      console.log(`      ❌ Deficiente: ${data.breakdown.poor}`);
    }

    // Probar análisis de usuario específico (usar el primer usuario de la lista)
    if (usersResponse.data.success && usersResponse.data.data.users.length > 0) {
      const firstUser = usersResponse.data.data.users[0];
      console.log(`\n📊 Analizando usuario específico: ${firstUser.nombre}...`);
      
      const userReportResponse = await axios.get(`${API_BASE}/semantics/user/${firstUser.id}/report`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (userReportResponse.data.success) {
        const data = userReportResponse.data.data;
        console.log('✅ Análisis de usuario específico completado:');
        console.log(`   👤 Usuario: ${data.user}`);
        console.log(`   📚 Total recursos: ${data.totalResources}`);
        console.log(`   📝 Gramática promedio: ${data.metrics.averageGrammar}%`);
        console.log(`   📖 TTR promedio: ${data.metrics.averageTTR}`);
        console.log(`   🏆 Calidad general: ${data.metrics.overallQuality}`);
      }
    }

  } catch (error) {
    console.log('❌ Error en análisis por usuario:', error.response?.data?.message || error.message);
  }
}

// Función principal de prueba
async function runMetricsTest() {
  console.log('🚀 Iniciando pruebas de métricas semánticas\n');
  
  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ No se pudo hacer login. Terminando pruebas.');
    return;
  }
  
  // 2. Obtener o crear recursos
  let resources = await getExistingResources();
  
  if (resources.length === 0) {
    console.log('📝 No hay recursos. Creando recursos de prueba...');
    resources = await createTestResources();
  }
  
  if (resources.length === 0) {
    console.log('❌ No se pudieron obtener recursos para analizar.');
    return;
  }
  
  // 3. Probar análisis individual
  if (resources.length > 0) {
    await testSingleResourceAnalysis(resources[0].id);
  }
  
  // 4. Probar análisis en lote
  await testBatchAnalysis();
  
  // 5. Probar reporte completo
  await testFullReport();
  
  // 6. Probar análisis por usuario
  await testUserAnalysis();
  
  console.log('\n🎉 Pruebas de métricas completadas!');
  console.log('\n📝 Endpoints disponibles:');
  console.log(`   • Usuarios disponibles: GET ${API_BASE}/semantics/users`);
  console.log(`   • Mis recursos: GET ${API_BASE}/semantics/my-report`);
  console.log(`   • Usuario específico: GET ${API_BASE}/semantics/user/{userId}/report`);
  console.log(`   • Análisis individual: GET ${API_BASE}/semantics/resource/{id}`);
  console.log(`   • Análisis en lote: GET ${API_BASE}/semantics/batch`);
  console.log(`   • Reporte completo: GET ${API_BASE}/semantics/report`);
}

// Ejecutar pruebas
runMetricsTest().catch(console.error);
