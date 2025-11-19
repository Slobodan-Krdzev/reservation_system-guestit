"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const scheduler_service_1 = require("./services/scheduler.service");
const bootstrap = async () => {
    await (0, db_1.connectDb)();
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.port, () => {
        // eslint-disable-next-line no-console
        console.log(`Server running on http://localhost:${env_1.env.port}`);
    });
    // Start the demo reservation approval scheduler
    (0, scheduler_service_1.startReservationScheduler)();
};
void bootstrap();
//# sourceMappingURL=index.js.map