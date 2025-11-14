import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { hashPassword } from '../src/utils/password';
import { generateAccessToken } from '../src/utils/jwt';

const app = createApp();

describe('Reservation routes', () => {
  it('creates and lists reservations for authenticated user', async () => {
    const user = await User.create({
      firstName: 'Res',
      lastName: 'Tester',
      email: 'res@example.com',
      phone: '9998887777',
      passwordHash: await hashPassword('Password123'),
      isVerified: true,
    });
    const token = generateAccessToken(user.id);

    const createResponse = await request(app)
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

    const listResponse = await request(app)
      .get('/api/reservations')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.reservations).toHaveLength(1);
  });
});

