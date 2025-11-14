"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
const User_1 = require("../models/User");
const Reservation_1 = require("../models/Reservation");
const Floorplan_1 = require("../models/Floorplan");
const floorplans_1 = require("../data/floorplans");
const password_1 = require("../utils/password");
const seed = async () => {
    await (0, db_1.connectDb)();
    await Promise.all([User_1.User.deleteMany({}), Reservation_1.Reservation.deleteMany({}), Floorplan_1.Floorplan.deleteMany({})]);
    const [verifiedUser, unverifiedUser] = await User_1.User.create([
        {
            firstName: 'Verified',
            lastName: 'User',
            email: 'verified@example.com',
            phone: '1234567890',
            passwordHash: await (0, password_1.hashPassword)('Password123'),
            isVerified: true,
            subscription: { tier: 'free', status: 'inactive' },
        },
        {
            firstName: 'Pending',
            lastName: 'User',
            email: 'pending@example.com',
            phone: '0987654321',
            passwordHash: await (0, password_1.hashPassword)('Password123'),
            isVerified: false,
            verificationToken: 'seed-token',
            subscription: { tier: 'free', status: 'inactive' },
        },
    ]);
    await Floorplan_1.Floorplan.insertMany(floorplans_1.sampleFloorplans.map((fp) => ({
        externalId: fp.id,
        name: fp.name,
        sections: fp.sections,
        tables: fp.tables,
    })));
    await Reservation_1.Reservation.create({
        userId: verifiedUser.id,
        floorplanId: floorplans_1.sampleFloorplans[0].id,
        tableId: floorplans_1.sampleFloorplans[0].tables[0].id,
        date: '2025-11-20',
        timeSlot: '19:00',
        guests: 2,
        status: 'active',
    });
    // eslint-disable-next-line no-console
    console.log('Seed completed. Verified user: verified@example.com / Password123');
    await mongoose_1.default.disconnect();
};
seed().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map