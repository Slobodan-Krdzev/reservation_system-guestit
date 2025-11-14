import nodemailer from 'nodemailer';
import { env } from './env';

export const mailer = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verifyUrl = `${env.frontendUrl}/auth/verify?token=${token}`;
  const message = {
    from: env.smtpFromEmail,
    to: email,
    subject: 'Verify your Reservation System account',
    text: `Please verify your account by visiting: ${verifyUrl}`,
    html: `<p>Please verify your account by clicking <a href="${verifyUrl}">here</a>.</p>`,
  };

  try {
    await mailer.sendMail(message);
  } catch (error) {
    // For development, log the URL even if mail fails
    // eslint-disable-next-line no-console
    console.warn('Failed to send email via SMTP, logging verification URL instead:', verifyUrl);
  }
  // Always log token for development
  // eslint-disable-next-line no-console
  console.log(`Verification token for ${email}: ${verifyUrl}`);
};

