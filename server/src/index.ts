/* eslint-disable no-console */
import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { startReservationScheduler } from './services/scheduler.service';

const log = (message: string, extra?: unknown) => {
  const timestamp = new Date().toISOString();
  if (extra) {
    console.log(`[${timestamp}] [server] ${message}`, extra);
    return;
  }
  console.log(`[${timestamp}] [server] ${message}`);
};

const logError = (message: string, error: unknown) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [server] ${message}`, error);
};

const registerProcessHandlers = () => {
  process.on('unhandledRejection', (reason) => {
    logError('Unhandled promise rejection detected', reason);
  });

  process.on('uncaughtException', (error) => {
    logError('Uncaught exception detected', error);
  });
};

const bootstrap = async () => {
  registerProcessHandlers();

  log('Connecting to MongoDB…');
  await connectDb();
  log('Database connection established');

  const app = createApp();

  const server = app.listen(env.port, () => {
    log(`Server running on port ${env.port}`, {
      mode: env.nodeEnv,
      url: `http://localhost:${env.port}`,
    });
  });

  server.on('error', (error) => {
    logError('HTTP server error', error);
  });

  log('Starting reservation scheduler');
  startReservationScheduler();
  log('Reservation scheduler started');
};

void bootstrap();

