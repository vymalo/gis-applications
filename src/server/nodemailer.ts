import { env } from '@app/env';
import nodemailer from 'nodemailer';

const createTransporter = () => nodemailer.createTransport(env.SMTP_URL);

const globalForTransporter = globalThis as unknown as {
  transporter: ReturnType<typeof createTransporter> | undefined;
};

export const transporter =
  globalForTransporter.transporter ?? createTransporter();

if (env.NODE_ENV !== 'production')
  globalForTransporter.transporter = transporter;
