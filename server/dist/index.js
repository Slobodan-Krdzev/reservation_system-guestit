"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const bootstrap = async () => {
    await (0, db_1.connectDb)();
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.port, () => {
        // eslint-disable-next-line no-console
        console.log(`Server running on http://localhost:${env_1.env.port}`);
    });
};
void bootstrap();
//# sourceMappingURL=index.js.map