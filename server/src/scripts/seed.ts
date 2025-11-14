import mongoose from 'mongoose';
import { connectDb } from '../config/db';
import { User } from '../models/User';
import { Reservation } from '../models/Reservation';
import { Floorplan } from '../models/Floorplan';
import { sampleFloorplans } from '../data/floorplans';
import { hashPassword } from '../utils/password';

const seed = async () => {
  await connectDb();

  await Promise.all([User.deleteMany({}), Reservation.deleteMany({}), Floorplan.deleteMany({})]);

  const [verifiedUser, unverifiedUser] = await User.create([
    {
      firstName: 'Verified',
      lastName: 'User',
      email: 'verified@example.com',
      phone: '1234567890',
      passwordHash: await hashPassword('Password123'),
      isVerified: true,
      subscription: { tier: 'free', status: 'inactive' },
    },
    {
      firstName: 'Pending',
      lastName: 'User',
      email: 'pending@example.com',
      phone: '0987654321',
      passwordHash: await hashPassword('Password123'),
      isVerified: false,
      verificationToken: 'seed-token',
      subscription: { tier: 'free', status: 'inactive' },
    },
  ]);

  await Floorplan.insertMany(
    sampleFloorplans.map((fp) => ({
      externalId: fp.id,
      name: fp.name,
      sections: fp.sections,
      tables: fp.tables,
    })),
  );

  await Reservation.create({
    userId: verifiedUser.id,
    floorplanId: sampleFloorplans[0].id,
    tableId: sampleFloorplans[0].tables[0].id,
    date: '2025-11-20',
    timeSlot: '19:00',
    guests: 2,
    status: 'active',
  });

  // eslint-disable-next-line no-console
  console.log('Seed completed. Verified user: verified@example.com / Password123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', err);
  process.exit(1);
});

