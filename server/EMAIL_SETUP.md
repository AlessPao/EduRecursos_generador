# Configuración de Email para Producción

## Problema Común
Si el envío de emails se queda "cargando" en producción pero funciona en local, puede deberse a:

1. **Restricciones de Gmail en servidores cloud** - Gmail puede bloquear conexiones desde IPs de servidores
2. **Falta de configuración de timeout** - Sin timeouts, la petición espera indefinidamente
3. **Firewall o restricciones de red** del proveedor de hosting

## Soluciones Implementadas

### 1. Timeouts Configurados
- `connectionTimeout`: 10 segundos
- `greetingTimeout`: 10 segundos  
- `socketTimeout`: 10 segundos
- Timeout adicional de 15 segundos en el controlador

### 2. Variables de Entorno Requeridas
```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### 3. Configuración de Gmail

#### Para usar Gmail en producción:

1. **Habilitar "Contraseñas de Aplicación"**:
   - Ve a tu cuenta de Google: https://myaccount.google.com/security
   - Habilita la verificación en 2 pasos
   - Genera una "Contraseña de aplicación" específica para tu app
   - Usa esa contraseña (16 caracteres) en `EMAIL_PASS`

2. **Verificar que el email no esté bloqueado**:
   - Revisa https://myaccount.google.com/device-activity
   - Permite el acceso desde tu servidor si aparece bloqueado

## Alternativas a Gmail (Recomendadas para Producción)

### SendGrid (Gratis hasta 100 emails/día)
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Mailgun (Gratis hasta 5,000 emails/mes)
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USERNAME,
    pass: process.env.MAILGUN_PASSWORD
  }
});
```

### Resend (Gratis hasta 3,000 emails/mes)
```bash
npm install resend
```
```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: email,
  subject: 'Código de recuperación',
  html: `...`
});
```

## Debugging en Producción

### Ver logs en Railway/Render:
```bash
# Railway
railway logs

# Render
# Ve al dashboard -> tu servicio -> Logs
```

### Verificar que las variables de entorno estén configuradas:
```javascript
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
// NO imprimas EMAIL_PASS por seguridad
```

### Test manual del servicio de email:
```javascript
// Agregar ruta temporal de prueba
router.get('/test-email', async (req, res) => {
  try {
    await sendRecoveryCode('tu-email@test.com', '123456');
    res.json({ success: true, message: 'Email enviado' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: error.stack 
    });
  }
});
```

## Checklist de Despliegue

- [ ] Variables de entorno configuradas en el servicio de producción
- [ ] Contraseña de aplicación de Gmail generada (no la contraseña normal)
- [ ] Verificación en 2 pasos habilitada en Gmail
- [ ] IP del servidor no bloqueada por Gmail
- [ ] Logs revisados para ver errores específicos
- [ ] Puerto 587 no bloqueado por el firewall del hosting
- [ ] Considerar migrar a SendGrid/Mailgun/Resend para mayor confiabilidad

## Notas de Seguridad

1. **NUNCA** subas el archivo `.env` a git
2. Usa **contraseñas de aplicación**, no tu contraseña real de Gmail
3. Rota las contraseñas regularmente
4. Monitorea los logs para detectar intentos de envío fallidos
