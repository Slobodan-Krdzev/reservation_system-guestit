"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const scheduler_service_1 = require("./services/scheduler.service");
const formatMessage = (message) => `[${new Date().toISOString()}] [server] ${message}`;
const log = (message, extra) => {
    const base = formatMessage(message);
    if (extra) {
        process.stdout.write(`${base} ${JSON.stringify(extra)}\n`);
        return;
    }
    process.stdout.write(`${base}\n`);
};
const logError = (message, error) => {
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
    await (0, db_1.connectDb)();
    log('Database connection established');
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.port, () => {
        log(`Server running on port ${env_1.env.port}`, {
            mode: env_1.env.nodeEnv,
            url: `http://localhost:${env_1.env.port}`,
        });
    });
    server.on('error', (error) => {
        logError('HTTP server error', error);
    });
    log('Starting reservation scheduler');
    (0, scheduler_service_1.startReservationScheduler)();
    log('Reservation scheduler started');
};
bootstrap().catch((error) => {
    logError('Failed to bootstrap application', error);
    process.exitCode = 1;
});
//# sourceMappingURL=index.js.map