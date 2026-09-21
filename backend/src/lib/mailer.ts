import * as nodemailer from "nodemailer";

// NOTA: configurare le variabili d'ambiente SMTP_* con il proprio provider
// (es. Ethereal per i test, SendGrid/Mailgun/SMTP reale in produzione).
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class MailService {
  async sendConfirmationEmail(to: string, token: string): Promise<void> {
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const confirmationLink = `${baseUrl}/api/auth/confirm/${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@bankingapp.local",
      to,
      subject: "Conferma la tua registrazione",
      html: `
        <p>Benvenuto in BankingApp,</p>
        <p>per completare la registrazione clicca sul link seguente (valido 24 ore):</p>
        <p><a href="${confirmationLink}">${confirmationLink}</a></p>
      `,
    });
  }
}

export default new MailService();
