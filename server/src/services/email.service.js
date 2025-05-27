import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS } from '../config/index.js';

// Configurar el transportador de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Verificar la configuración del transportador
transporter.verify((error, success) => {
  if (error) {
    console.error('Error en la configuración del email:', error);
  } else {
    console.log('Servidor de email configurado correctamente');
  }
});

// Función para enviar código de recuperación
export const sendRecoveryCode = async (email, code) => {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Código de recuperación de contraseña - Educa Recursos',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6;">Educa Recursos</h1>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h2 style="color: #334155; margin-top: 0;">Recuperación de contraseña</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Has solicitado recuperar tu contraseña. Usa el siguiente código para continuar:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #3b82f6; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 8px; letter-spacing: 3px;">
              ${code}
            </span>
          </div>
          <p style="color: #64748b; line-height: 1.6;">
            Este código expira en 15 minutos por seguridad.
          </p>
          <p style="color: #64748b; line-height: 1.6; font-size: 14px;">
            Si no solicitaste este código, puedes ignorar este email de forma segura.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
          <p>© 2025 Educa Recursos. Todos los derechos reservados.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('Error al enviar el código de recuperación');
  }
};
