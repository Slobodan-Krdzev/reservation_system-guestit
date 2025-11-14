"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
let mongoServer;
beforeAll(async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose_1.default.connect(uri);
});
afterEach(async () => {
    const db = mongoose_1.default.connection.db;
    if (!db)
        return;
    const collections = await db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
});
//# sourceMappingURL=setup.js.map