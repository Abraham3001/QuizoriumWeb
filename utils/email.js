const nodemailer = require('nodemailer');

// Configura tu transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Si usas puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



/**
 * Envía el correo con el código de verificación
 * @param {string} to - Email destino
 * @param {string} code - Código de verificación
 */
async function enviarCorreoDeVerificacion(to, code) {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;padding:20px;">
    <h2 style="color:#4a90e2;">Bienvenido a Quizorium 🎓</h2>
    <p>Gracias por registrarte, para activar tu cuenta ingresa este código de verificación:</p>
    <div style="font-size:24px;font-weight:bold;background:#f5f5f5;border-radius:8px;padding:15px;text-align:center;margin:20px 0;color:#333;">
      ${code}
    </div>
    <p>Si no solicitaste esta cuenta, ignora este mensaje.</p>
    <hr/>
    <p style="font-size:0.9rem;color:#888;">Este es un correo automático de <strong>do-not-reply@quizorium.com</strong></p>
  </div>`;

  await transporter.sendMail({
    from: '"Quizorium" <do-not-reply@quizorium.com>',
    to,
    subject: "Tu código de verificación",
    html
  });
}
/**
 * Envía un correo para cambio de contraseña con código
 */
async function enviarCodigoCambioPassword(to, codigo) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;padding:20px;">
      <h2 style="color:#4a90e2;">Cambio de contraseña 🛡️</h2>
      <p>Usa este código para confirmar tu cambio de contraseña:</p>
      <div style="font-size:28px;font-weight:bold;background:#f0f0f0;border-radius:8px;padding:15px;text-align:center;margin:20px 0;">
        ${codigo}
      </div>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    </div>
  `;
  await transporter.sendMail({
    from: '"QuizLab" <do-not-reply@quizlab.com>',
    to,
    subject: 'Código de verificación para cambio de contraseña',
    html
  });
}

/**
 * Envía correo de confirmación de cambio
 */
async function enviarConfirmacionCambioPassword(to, nombre) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;padding:20px;">
      <h2 style="color:#4a90e2;">Contraseña actualizada 🔐</h2>
      <p>Hola <strong>${nombre}</strong>, tu contraseña fue cambiada correctamente.</p>
      <p>Si tú no realizaste este cambio, por favor comunícate con tu profesor inmediatamente.</p>
    </div>
  `;
  await transporter.sendMail({
    from: '"QuizLab" <do-not-reply@quizlab.com>',
    to,
    subject: 'Confirmación de cambio de contraseña',
    html
  });
}

module.exports = {
  enviarCorreoDeVerificacion,
  enviarCodigoCambioPassword,
  enviarConfirmacionCambioPassword
};

module.exports = { enviarCorreoDeVerificacion };
