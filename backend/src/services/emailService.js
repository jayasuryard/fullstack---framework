import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (config.smtp.host) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  } else {
    logger.warn('SMTP not configured, using console transport');
    transporter = {
      sendMail: async (options) => {
        logger.info('Email log:', options);
      },
    };
  }

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, { error: error.message });
    throw error;
  }
}
