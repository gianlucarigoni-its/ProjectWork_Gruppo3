import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendConfirmationEmail(to: string, token: string) {
  const confirmUrl = `${process.env.APP_BASE_URL}/api/auth/confirm/${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? '"BankInApp" <no-reply@bankinapp.com>',
    to,
    subject: "Conferma la tua registrazione",
    html: `<p>Clicca per confermare il tuo account:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
  });
}
