"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
const httpError_1 = require("../utils/httpError");
const requireAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies?.token;
        if (!token) {
            throw (0, httpError_1.createHttpError)(401, 'Authentication required');
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await User_1.User.findById(payload.sub);
        if (!user) {
            throw (0, httpError_1.createHttpError)(401, 'User not found');
        }
        req.user = user;
        next();
    }
    catch (error) {
        next((0, httpError_1.createHttpError)(401, 'Invalid or expired token'));
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.js.map