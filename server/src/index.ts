/* eslint-disable no-console */
import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { startReservationScheduler } from './services/scheduler.service';

const formatMessage = (message: string) => `[${new Date().toISOString()}] [server] ${message}`;

const log = (message: string, extra?: unknown) => {
  const base = formatMessage(message);
  if (extra) {
    process.stdout.write(`${base} ${JSON.stringify(extra)}\n`);
    return;
  }
  process.stdout.write(`${base}\n`);
};

const logError = (message: string, error: unknown) => {
  const base = formatMessage(message);
  process.stderr.write(`${base} ${error instanceof Error ? error.stack ?? error.message : JSON.stringify(error)}\n`);
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

bootstrap().catch((error) => {
  logError('Failed to bootstrap application', error);
  process.exitCode = 1;
});

