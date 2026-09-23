import "dotenv/config";
import nodemailer from "nodemailer";

export class MailService {
  // Il transporter si configura tramite env vars:
  // in locale usi Ethereal (mail fake, nessuna config reale necessaria)
  // in produzione usi le credenziali SMTP istituzionali
  private createTransporter() {
    console.log("ETHEREAL_USER:", process.env.ETHEREAL_USER);
    console.log("ETHEREAL_PASS:", process.env.ETHEREAL_PASS);
    // Se non c'è SMTP_HOST configurato, usa Ethereal in automatico
    if (!process.env.SMTP_HOST) {
      // Ethereal: cattura le mail senza inviarle davvero,
      // puoi vederle su https://ethereal.email
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER, // genera un account su ethereal.email
          pass: process.env.ETHEREAL_PASS,
        },
      });
    }

    // Produzione: SMTP istituzionale (es. Gmail, Outlook, ecc.)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true per porta 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(toEmail: string, token: string): Promise<boolean> {
    try {
      const transporter = this.createTransporter();
      const baseUrl = process.env.APP_URL || "http://localhost:3000";
      const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

      const info = await transporter.sendMail({
        from: `"Banca ITS" <${process.env.SMTP_USER || process.env.ETHEREAL_USER}>`,
        to: toEmail,
        subject: "Conferma la tua registrazione",
        html: `
  <h2>Benvenuto!</h2>
  <p>Clicca il link qui sotto per confermare la tua email e attivare il conto:</p>
  <a href="${verifyUrl}" style="
    display: inline-block;
    padding: 12px 24px;
    background: #1a73e8;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  ">Conferma Email</a>
  <p>Il link scade tra 24 ore.</p>
  <p>Se non hai richiesto la registrazione, ignora questa mail.</p>
`,
      });

      if (!process.env.SMTP_HOST) {
        console.log("📧 Preview mail (Ethereal):", nodemailer.getTestMessageUrl(info));
      }

      return true;
    } catch (err) {
      console.error("Errore invio mail:", err);
      return false;
    }
  }
}

export default new MailService();
