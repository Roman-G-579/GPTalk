import nodemailer from 'nodemailer';
import { Config } from '../config/config';

export async function sendMail(mailOptions: { from: string, to: string, subject: string, text: string }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: Config.ADMIN_EMAIL,
      pass: Config.ADMIN_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return await transporter.sendMail(mailOptions);
}
