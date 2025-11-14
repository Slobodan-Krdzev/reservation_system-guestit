"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reservation = void 0;
const mongoose_1 = require("mongoose");
const reservationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    floorplanId: { type: String, required: true },
    tableId: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    guests: { type: Number, required: true },
    status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
}, { timestamps: true });
exports.Reservation = (0, mongoose_1.model)('Reservation', reservationSchema);
//# sourceMappingURL=Reservation.js.map