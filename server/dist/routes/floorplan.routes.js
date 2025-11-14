"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const floorplan_controller_1 = require("../controllers/floorplan.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, floorplan_controller_1.listFloorplansController);
router.get('/:id/availability', auth_1.requireAuth, floorplan_controller_1.floorplanAvailabilityController);
exports.default = router;
//# sourceMappingURL=floorplan.routes.js.map