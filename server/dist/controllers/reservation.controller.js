"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelReservationController = exports.createReservationController = exports.listReservationsController = void 0;
const reservation_service_1 = require("../services/reservation.service");
const listReservationsController = async (req, res) => {
    const reservations = await (0, reservation_service_1.listReservations)(req.user.id);
    res.json({ reservations });
};
exports.listReservationsController = listReservationsController;
const createReservationController = async (req, res) => {
    const reservation = await (0, reservation_service_1.createReservation)({
        ...req.body,
        userId: req.user.id,
    });
    res.status(201).json({ reservation });
};
exports.createReservationController = createReservationController;
const cancelReservationController = async (req, res) => {
    const reservation = await (0, reservation_service_1.cancelReservation)(req.params.id, req.user.id);
    res.json({ reservation });
};
exports.cancelReservationController = cancelReservationController;
//# sourceMappingURL=reservation.controller.js.map