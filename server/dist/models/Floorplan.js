"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Floorplan = void 0;
const mongoose_1 = require("mongoose");
const sectionSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
}, { _id: false });
const tableSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ['free', 'reserved', 'unavailable'], default: 'free' },
}, { _id: false });
const floorplanSchema = new mongoose_1.Schema({
    externalId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sections: [sectionSchema],
    tables: [tableSchema],
}, { timestamps: true });
exports.Floorplan = (0, mongoose_1.model)('Floorplan', floorplanSchema);
//# sourceMappingURL=Floorplan.js.map