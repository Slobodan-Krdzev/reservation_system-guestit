"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const User_1 = require("../src/models/User");
const password_1 = require("../src/utils/password");
jest.mock('../src/config/mailer', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));
const app = (0, app_1.createApp)();
describe('Auth routes', () => {
    it('registers, verifies and logs in a user', async () => {
        const registerResponse = await (0, supertest_1.default)(app).post('/api/auth/register').send({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '1112223333',
            password: 'Password123',
        });
        expect(registerResponse.status).toBe(201);
        const user = await User_1.User.findOne({ email: 'test@example.com' });
        expect(user).toBeTruthy();
        await (0, supertest_1.default)(app)
            .get('/api/auth/verify')
            .query({ token: user.verificationToken });
        const loginResponse = await (0, supertest_1.default)(app).post('/api/auth/login').send({
            identifier: 'test@example.com',
            password: 'Password123',
        });
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.token).toBeDefined();
    });
    it('rejects login for unverified user', async () => {
        await User_1.User.create({
            firstName: 'Nope',
            lastName: 'User',
            email: 'nope@example.com',
            phone: '2223334444',
            passwordHash: await (0, password_1.hashPassword)('Password123'),
            isVerified: false,
        });
        const response = await (0, supertest_1.default)(app).post('/api/auth/login').send({
            identifier: 'nope@example.com',
            password: 'Password123',
        });
        expect(response.status).toBe(403);
    });
});
//# sourceMappingURL=auth.test.js.map