const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};


//Enviar email de recuperación de contraseña
 
const sendPasswordResetEmail = async (email, resetToken) => {
    const transporter = createTransporter();
    
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const textContent = `
Hola,

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Habit Tracker.

Para crear una nueva contraseña, haz clic en el siguiente enlace:

${resetLink}

⚠️ IMPORTANTE:
- Este enlace es válido por 1 hora
- Si no solicitaste este cambio, ignora este correo
- Nunca compartas este enlace con nadie

Saludos,
El equipo de Habit Tracker

---
Este es un correo automático, por favor no respondas directamente.
© 2025 Habit Tracker. Todos los derechos reservados.
    `;
    
    const mailOptions = {
        from: `"Habit Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Recuperación de Contraseña - Habit Tracker',
        text: textContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo enviado exitosamente a:', email);
    console.log('Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
};


 //Enviar email de confirmación de cambio de contraseña

const sendPasswordChangedEmail = async (email, userName) => {
    try {
        const transporter = createTransporter();
        
        const textContent = `
Hola ${userName},

Te confirmamos que tu contraseña ha sido cambiada exitosamente.

Fecha y hora: ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}

⚠️ ¿No fuiste tú?
Si no realizaste este cambio, contacta con soporte inmediatamente.

Ya puedes iniciar sesión con tu nueva contraseña.

Saludos,
El equipo de Habit Tracker

---
© 2025 Habit Tracker. Todos los derechos reservados.
        `;
        
        const mailOptions = {
            from: `"Habit Tracker" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Tu contraseña ha sido cambiada - Habit Tracker',
            text: textContent
        };
        
        await transporter.sendMail(mailOptions);
        console.log('Correo de confirmación enviado a:', email);
        
    } catch (error) {
        console.error('Error enviando correo de confirmación:', error.message);
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendPasswordChangedEmail
};