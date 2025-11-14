import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { hashPassword } from '../src/utils/password';

jest.mock('../src/config/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

const app = createApp();

describe('Auth routes', () => {
  it('registers, verifies and logs in a user', async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1112223333',
      password: 'Password123',
    });

    expect(registerResponse.status).toBe(201);

    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).toBeTruthy();

    await request(app)
      .get('/api/auth/verify')
      .query({ token: user!.verificationToken });

    const loginResponse = await request(app).post('/api/auth/login').send({
      identifier: 'test@example.com',
      password: 'Password123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
  });

  it('rejects login for unverified user', async () => {
    await User.create({
      firstName: 'Nope',
      lastName: 'User',
      email: 'nope@example.com',
      phone: '2223334444',
      passwordHash: await hashPassword('Password123'),
      isVerified: false,
    });

    const response = await request(app).post('/api/auth/login').send({
      identifier: 'nope@example.com',
      password: 'Password123',
    });

    expect(response.status).toBe(403);
  });
});

