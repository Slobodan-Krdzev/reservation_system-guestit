"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floorplanAvailabilityController = exports.listFloorplansController = void 0;
const floorplan_service_1 = require("../services/floorplan.service");
const listFloorplansController = (_req, res) => {
    res.json({ floorplans: (0, floorplan_service_1.getFloorplans)() });
};
exports.listFloorplansController = listFloorplansController;
const floorplanAvailabilityController = (req, res) => {
    res.json({
        floorplanId: req.params.id,
        availability: (0, floorplan_service_1.getFloorplanAvailability)(req.params.id),
    });
};
exports.floorplanAvailabilityController = floorplanAvailabilityController;
//# sourceMappingURL=floorplan.controller.js.map