"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshController = exports.oauthController = exports.loginController = exports.verifyController = exports.registerController = void 0;
const auth_service_1 = require("../services/auth.service");
const httpError_1 = require("../utils/httpError");
const env_1 = require("../config/env");
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
const registerController = async (req, res) => {
    if (req.file) {
        req.body.avatarUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }
    const user = await (0, auth_service_1.registerUser)(req.body);
    res.status(201).json({
        message: 'Account created. Please verify your email.',
        user: {
            id: user.id,
            email: user.email,
            isVerified: user.isVerified,
        },
    });
};
exports.registerController = registerController;
const verifyController = async (req, res) => {
    const token = req.query.token;
    if (!token) {
        throw (0, httpError_1.createHttpError)(400, 'Verification token is required');
    }
    await (0, auth_service_1.verifyEmailToken)(token);
    res.json({ message: 'Email verified successfully' });
};
exports.verifyController = verifyController;
const loginController = async (req, res) => {
    const { identifier, password } = req.body;
    const { user, accessToken, refreshToken } = await (0, auth_service_1.loginUser)(identifier, password);
    res.cookie('token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env_1.env.nodeEnv === 'production',
        maxAge: 60 * 60 * 1000,
    });
    res.json({
        token: accessToken,
        refreshToken,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            subscription: user.subscription,
            reservations: user.reservations,
        },
    });
};
exports.loginController = loginController;
const oauthController = async (req, res) => {
    const { provider, email, firstName, lastName, oauthId } = req.body;
    if (!provider || !email || !firstName || !lastName || !oauthId) {
        throw (0, httpError_1.createHttpError)(400, 'Missing OAuth payload');
    }
    const { user, accessToken, refreshToken } = await (0, auth_service_1.oauthLogin)({
        provider,
        email,
        firstName,
        lastName,
        oauthId,
    });
    res.cookie('token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env_1.env.nodeEnv === 'production',
        maxAge: 60 * 60 * 1000,
    });
    res.json({
        token: accessToken,
        refreshToken,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            reservations: user.reservations,
        },
    });
};
exports.oauthController = oauthController;
const refreshController = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw (0, httpError_1.createHttpError)(400, 'Refresh token is required');
    }
    try {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const user = await User_1.User.findById(payload.sub);
        if (!user) {
            throw (0, httpError_1.createHttpError)(401, 'Invalid refresh token');
        }
        const newAccessToken = (0, jwt_1.generateAccessToken)(user.id);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        throw (0, httpError_1.createHttpError)(401, 'Invalid or expired refresh token');
    }
};
exports.refreshController = refreshController;
//# sourceMappingURL=auth.controller.js.map