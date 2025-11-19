"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPendingReservations = exports.approvePendingReservation = exports.updateReservationStatus = exports.cancelReservation = exports.createReservation = exports.listReservations = void 0;
const mongoose_1 = require("mongoose");
const Reservation_1 = require("../models/Reservation");
const User_1 = require("../models/User");
const Notification_1 = require("../models/Notification");
const httpError_1 = require("../utils/httpError");
const mailer_1 = require("../config/mailer");
const resolveReservationDate = (date, timeSlot) => {
    const isoString = `${date}T${timeSlot}:00`;
    const parsed = new Date(isoString);
    return Number.isNaN(parsed.valueOf()) ? null : parsed;
};
const refreshReservationStatuses = async (reservations) => {
    const now = new Date();
    const updates = [];
    reservations.forEach((reservation) => {
        if (reservation.status === 'pending' || reservation.status === 'active') {
            const targetDate = resolveReservationDate(reservation.date, reservation.timeSlot);
            if (targetDate && targetDate < now) {
                reservation.status = 'finished';
                updates.push(reservation.save());
            }
        }
    });
    if (updates.length) {
        await Promise.all(updates);
    }
};
const listReservations = async (userId) => {
    const reservations = await Reservation_1.Reservation.find({ userId }).sort({ createdAt: -1 });
    await refreshReservationStatuses(reservations);
    const favorites = await Reservation_1.Reservation.aggregate([
        { $match: { userId: new mongoose_1.Types.ObjectId(userId), status: 'finished' } },
        {
            $group: {
                _id: '$tableId',
                count: { $sum: 1 },
                tableName: { $last: '$tableName' },
                floorplanId: { $last: '$floorplanId' },
                lastDate: { $last: '$date' },
                lastTime: { $last: '$timeSlot' },
            },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 2 },
        {
            $project: {
                _id: 0,
                tableId: '$_id',
                tableName: 1,
                floorplanId: 1,
                count: 1,
                lastDate: 1,
                lastTime: 1,
            },
        },
    ]);
    return { reservations, favorites };
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
        status: 'pending',
    });
    await User_1.User.findByIdAndUpdate(input.userId, {
        $addToSet: { reservations: reservation._id },
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
const updateReservationStatus = async (reservationId, status) => {
    const reservation = await Reservation_1.Reservation.findById(reservationId);
    if (!reservation) {
        throw (0, httpError_1.createHttpError)(404, 'Reservation not found');
    }
    reservation.status = status;
    await reservation.save();
    return reservation;
};
exports.updateReservationStatus = updateReservationStatus;
/**
 * Approves a pending reservation and sends an approval email to the user.
 * This is used for the demo/MVP flow where reservations are auto-approved after 30 seconds.
 */
const approvePendingReservation = async (reservationId) => {
    const reservation = await Reservation_1.Reservation.findById(reservationId).populate('userId', 'firstName lastName email');
    if (!reservation) {
        return null;
    }
    if (reservation.status !== 'pending') {
        return null;
    }
    // Extract userId ObjectId from populated document
    const userIdObjectId = reservation.userId instanceof mongoose_1.Types.ObjectId
        ? reservation.userId
        : reservation.userId._id;
    reservation.status = 'active';
    await reservation.save();
    // Send approval email
    const user = reservation.userId;
    if (user && user.email) {
        try {
            await (0, mailer_1.sendReservationApprovalEmail)(user.email, {
                firstName: user.firstName,
                lastName: user.lastName,
                tableName: reservation.tableName || `Table ${reservation.tableId}`,
                date: reservation.date,
                timeSlot: reservation.timeSlot,
                guests: reservation.guests,
            });
        }
        catch (error) {
            // Log error but don't fail the approval
            // eslint-disable-next-line no-console
            console.error(`Failed to send approval email for reservation ${reservationId}:`, error);
        }
    }
    // Create in-app notification
    try {
        await Notification_1.Notification.create({
            userId: userIdObjectId,
            type: 'reservationApproved',
            message: `Your reservation for ${reservation.tableName || `Table ${reservation.tableId}`} on ${reservation.date} at ${reservation.timeSlot} has been approved.`,
            reservationId: reservation._id,
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to create notification for reservation ${reservationId}:`, error);
    }
    // Fetch the reservation again without populate to return the correct type
    const updatedReservation = await Reservation_1.Reservation.findById(reservationId);
    return updatedReservation;
};
exports.approvePendingReservation = approvePendingReservation;
/**
 * Processes pending reservations that are older than 30 seconds and approves them.
 * This is the demo/MVP auto-approval logic.
 */
const processPendingReservations = async () => {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const pendingReservations = await Reservation_1.Reservation.find({
        status: 'pending',
        createdAt: { $lte: thirtySecondsAgo },
    });
    for (const reservation of pendingReservations) {
        try {
            const reservationId = String(reservation._id);
            await (0, exports.approvePendingReservation)(reservationId);
            // eslint-disable-next-line no-console
            console.log(`Auto-approved reservation ${reservationId} (demo flow)`);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Failed to approve reservation ${String(reservation._id)}:`, error);
        }
    }
};
exports.processPendingReservations = processPendingReservations;
//# sourceMappingURL=reservation.service.js.map