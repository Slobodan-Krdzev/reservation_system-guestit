import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET', 'SMTP_FROM_EMAIL'];

required.forEach((key) => {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`Warning: Missing env var ${key}. Please set it in your .env file.`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 5026,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reservation-system',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  smtpHost: process.env.SMTP_HOST || 'smtp.example.com',
  smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  smtpUser: process.env.SMTP_USER || 'user@example.com',
  smtpPass: process.env.SMTP_PASS || 'password',
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@example.com',
  externalFloorplanApiUrl:
    process.env.EXTERNAL_FLOORPLAN_API_URL || 'https://mocked-floorplans.local',
  uploadsDir: process.env.UPLOADS_DIR || 'uploads/avatars',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

