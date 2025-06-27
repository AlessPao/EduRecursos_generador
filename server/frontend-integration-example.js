// Ejemplo de integración en frontend (React/JavaScript)
class MetricsService {
  constructor(baseUrl = 'http://localhost:5000/api', token = '') {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async analyzeResource(resourceId) {
    const response = await fetch(`${this.baseUrl}/semantics/resource/${resourceId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async getBatchAnalysis(limit = 10) {
    const response = await fetch(`${this.baseUrl}/semantics/batch?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async getFullReport() {
    const response = await fetch(`${this.baseUrl}/semantics/report`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
}

// Ejemplo de uso
const metricsService = new MetricsService();
metricsService.setToken('tu-jwt-token');

// Analizar un recurso específico
metricsService.analyzeResource(139)
  .then(result => {
    console.log('Métricas del recurso:', result.data.metrics);
    console.log('Calidad general:', result.data.analysis.overallQuality);
  });

// Obtener reporte completo
metricsService.getFullReport()
  .then(report => {
    console.log('Promedio gramática:', report.data.summary.averageGrammar + '%');
    console.log('TTR promedio:', report.data.summary.averageTTR);
  });
