"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthController = exports.loginController = exports.verifyController = exports.registerController = void 0;
const auth_service_1 = require("../services/auth.service");
const httpError_1 = require("../utils/httpError");
const env_1 = require("../config/env");
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
        },
    });
};
exports.loginController = loginController;
const oauthController = async (req, res) => {
    const { provider, email, firstName, lastName, oauthId } = req.body;
    if (!provider || !email || !firstName || !lastName || !oauthId) {
        throw (0, httpError_1.createHttpError)(400, 'Missing OAuth payload');
    }
    const { user, accessToken } = await (0, auth_service_1.oauthLogin)({
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
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        },
    });
};
exports.oauthController = oauthController;
//# sourceMappingURL=auth.controller.js.map