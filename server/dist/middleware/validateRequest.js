"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const httpError_1 = require("../utils/httpError");
const validateRequest = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors
            .array()
            .map((err) => {
            const anyErr = err;
            const key = (typeof anyErr.param === 'string' && anyErr.param) ||
                (typeof anyErr.type === 'string' && anyErr.type) ||
                'unknown';
            const msg = typeof anyErr.msg === 'string' ? anyErr.msg : 'Invalid input';
            return `${key}: ${msg}`;
        })
            .join(', ');
        throw (0, httpError_1.createHttpError)(400, `Validation failed: ${errorMessages}`);
    }
    next();
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map