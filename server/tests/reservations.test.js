"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const User_1 = require("../src/models/User");
const password_1 = require("../src/utils/password");
const jwt_1 = require("../src/utils/jwt");
const app = (0, app_1.createApp)();
describe('Reservation routes', () => {
    it('creates and lists reservations for authenticated user', async () => {
        const user = await User_1.User.create({
            firstName: 'Res',
            lastName: 'Tester',
            email: 'res@example.com',
            phone: '9998887777',
            passwordHash: await (0, password_1.hashPassword)('Password123'),
            isVerified: true,
        });
        const token = (0, jwt_1.generateAccessToken)(user.id);
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/reservations')
            .set('Authorization', `Bearer ${token}`)
            .send({
            floorplanId: 'fp-main-hall',
            tableId: 'T1',
            date: '2025-12-24',
            timeSlot: '20:00',
            guests: 4,
        });
        expect(createResponse.status).toBe(201);
        const listResponse = await (0, supertest_1.default)(app)
            .get('/api/reservations')
            .set('Authorization', `Bearer ${token}`);
        expect(listResponse.status).toBe(200);
        expect(listResponse.body.reservations).toHaveLength(1);
    });
});
//# sourceMappingURL=reservations.test.js.map