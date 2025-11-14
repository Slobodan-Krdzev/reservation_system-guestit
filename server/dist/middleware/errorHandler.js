"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const httpError_1 = require("../utils/httpError");
const env_1 = require("../config/env");
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err instanceof httpError_1.HttpError ? err.statusCode : 500;
    const message = err.message || 'Unexpected error';
    res.status(statusCode).json({
        message,
        ...(env_1.env.nodeEnv === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map