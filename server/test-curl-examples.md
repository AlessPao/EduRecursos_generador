# Ejemplos de cURL para Probar Métricas

## 1. Obtener Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## 2. Analizar un Recurso Específico
```bash
curl -X GET http://localhost:5000/api/semantics/resource/139 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 3. Análisis en Lote (últimos 10 recursos)
```bash
curl -X GET "http://localhost:5000/api/semantics/batch?limit=10" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 4. Reporte Completo de Métricas
```bash
curl -X GET http://localhost:5000/api/semantics/report \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Respuesta de Ejemplo - Análisis Individual:
```json
{
  "success": true,
  "data": {
    "resourceId": 139,
    "title": "Comprensión sobre Animales",
    "type": "comprension",
    "metrics": {
      "totalSentences": 8,
      "grammaticallyCorrect": 8,
      "grammaticalAccuracy": 100,
      "totalWords": 45,
      "uniqueWords": 45,
      "typeTokenRatio": 1,
      "lexicalRichness": "Muy Alta"
    },
    "analysis": {
      "grammarQuality": "Excelente",
      "vocabularyDiversity": "Muy Alta",
      "overallQuality": "Excelente"
    },
    "recommendations": [
      "Excelente calidad gramatical"
    ],
    "analyzedAt": "2025-06-26T22:45:23.000Z"
  }
}
```

## Respuesta de Ejemplo - Reporte Completo:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalResources": 62,
      "analyzedResources": 62,
      "averageGrammar": 94,
      "averageTTR": 0.62,
      "overallQuality": "Excelente",
      "generatedAt": "26/6/2025"
    },
    "byResourceType": {
      "escritura": {
        "count": 3,
        "averageGrammar": 100,
        "averageTTR": 0.87
      },
      "comprension": {
        "count": 54,
        "averageGrammar": 93,
        "averageTTR": 0.60
      }
    },
    "insights": [
      "Excelente calidad gramatical promedio: 94%",
      "Buena riqueza léxica promedio: 0.97",
      "Mejor rendimiento: \"escritura\" (3 recursos)"
    ]
  }
}
```
