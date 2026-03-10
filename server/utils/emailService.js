import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("⚠️ SMTP_USER o SMTP_PASSWORD non configurati. L'invio email non funzionerà.");
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // TLS
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // e.g. marphco@gmail.com
      pass: process.env.SMTP_PASSWORD, // la password per le app da 16 caratteri
    },
  });
};

/**
 * Invia un'email base
 * @param {string} to - Indirizzo email destinatario
 * @param {string} subject - Oggetto
 * @param {string} html - Corpo dell'email in HTML
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `"Cartevite" <${process.env.EMAIL_FROM || 'hello@cartevite.com'}>`, // mittente (quello configurato su cloudflare/gmail alias)
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Errore invio email:", error);
    return { success: false, error: error.message };
  }
};
