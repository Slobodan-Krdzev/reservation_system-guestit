"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFloorplanAvailability = exports.getFloorplans = void 0;
const floorplans_1 = require("../data/floorplans");
const getFloorplans = () => {
    return floorplans_1.sampleFloorplans;
};
exports.getFloorplans = getFloorplans;
const getFloorplanAvailability = (floorplanId) => {
    const floorplan = floorplans_1.sampleFloorplans.find((fp) => fp.id === floorplanId);
    if (!floorplan) {
        return [];
    }
    return floorplan.tables.map((table) => ({
        tableId: table.id,
        status: Math.random() > 0.7 ? 'reserved' : 'free',
    }));
};
exports.getFloorplanAvailability = getFloorplanAvailability;
//# sourceMappingURL=floorplan.service.js.map