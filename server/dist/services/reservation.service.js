"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelReservation = exports.createReservation = exports.listReservations = void 0;
const Reservation_1 = require("../models/Reservation");
const httpError_1 = require("../utils/httpError");
const listReservations = (userId) => {
    return Reservation_1.Reservation.find({ userId }).sort({ createdAt: -1 });
};
exports.listReservations = listReservations;
const createReservation = async (input) => {
    const conflict = await Reservation_1.Reservation.findOne({
        tableId: input.tableId,
        floorplanId: input.floorplanId,
        date: input.date,
        timeSlot: input.timeSlot,
        status: 'active',
    });
    if (conflict) {
        throw (0, httpError_1.createHttpError)(409, 'Table already reserved for that time slot');
    }
    const reservation = await Reservation_1.Reservation.create({
        ...input,
        status: 'active',
    });
    return reservation;
};
exports.createReservation = createReservation;
const cancelReservation = async (reservationId, userId) => {
    const reservation = await Reservation_1.Reservation.findOne({ _id: reservationId, userId });
    if (!reservation) {
        throw (0, httpError_1.createHttpError)(404, 'Reservation not found');
    }
    reservation.status = 'cancelled';
    await reservation.save();
    return reservation;
};
exports.cancelReservation = cancelReservation;
//# sourceMappingURL=reservation.service.js.map