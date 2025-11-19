"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const reservation_controller_1 = require("../controllers/reservation.controller");
const auth_1 = require("../middleware/auth");
const validateRequest_1 = require("../middleware/validateRequest");
const router = (0, express_1.Router)();
const reservationValidation = [
    (0, express_validator_1.body)('floorplanId').notEmpty(),
    (0, express_validator_1.body)('tableId').notEmpty(),
    (0, express_validator_1.body)('tableName').notEmpty(),
    (0, express_validator_1.body)('date').notEmpty(),
    (0, express_validator_1.body)('timeSlot').notEmpty(),
    (0, express_validator_1.body)('guests').isInt({ min: 1 }),
];
router.get('/', auth_1.requireAuth, reservation_controller_1.listReservationsController);
router.post('/', auth_1.requireAuth, reservationValidation, validateRequest_1.validateRequest, reservation_controller_1.createReservationController);
router.delete('/:id', auth_1.requireAuth, reservation_controller_1.cancelReservationController);
router.patch('/:id/status', auth_1.requireAuth, [(0, express_validator_1.body)('status').isIn(['pending', 'active', 'cancelled', 'finished'])], validateRequest_1.validateRequest, reservation_controller_1.updateStatusController);
exports.default = router;
//# sourceMappingURL=reservation.routes.js.map