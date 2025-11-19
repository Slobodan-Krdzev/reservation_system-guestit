"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    tier: { type: String, enum: ['free', 'premium'], default: 'free' },
    status: { type: String, enum: ['inactive', 'active', 'past_due'], default: 'inactive' },
    startedAt: Date,
    expiresAt: Date,
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatarUrl: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    subscription: { type: subscriptionSchema, default: () => ({}) },
    reservations: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Reservation' }],
        default: [],
    },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=User.js.map