"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthLogin = exports.loginUser = exports.verifyEmailToken = exports.registerUser = void 0;
const uuid_1 = require("uuid");
const User_1 = require("../models/User");
const password_1 = require("../utils/password");
const httpError_1 = require("../utils/httpError");
const mailer_1 = require("../config/mailer");
const jwt_1 = require("../utils/jwt");
const registerUser = async (input) => {
    const existing = await User_1.User.findOne({
        $or: [{ email: input.email.toLowerCase() }, { phone: input.phone }],
    });
    if (existing) {
        throw (0, httpError_1.createHttpError)(409, 'Email or phone already in use');
    }
    const verificationToken = (0, uuid_1.v4)();
    const user = await User_1.User.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash: await (0, password_1.hashPassword)(input.password),
        ...(input.avatarUrl && { avatarUrl: input.avatarUrl }),
        verificationToken,
    });
    await (0, mailer_1.sendVerificationEmail)(user.email, verificationToken);
    return user;
};
exports.registerUser = registerUser;
const verifyEmailToken = async (token) => {
    const user = await User_1.User.findOne({ verificationToken: token });
    if (!user) {
        throw (0, httpError_1.createHttpError)(400, 'Invalid verification token');
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return user;
};
exports.verifyEmailToken = verifyEmailToken;
const loginUser = async (identifier, password) => {
    const user = await User_1.User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    });
    if (!user) {
        throw (0, httpError_1.createHttpError)(401, 'Invalid credentials');
    }
    if (!user.isVerified) {
        throw (0, httpError_1.createHttpError)(403, 'Please verify your email before logging in');
    }
    const isValid = await (0, password_1.comparePassword)(password, user.passwordHash);
    if (!isValid) {
        throw (0, httpError_1.createHttpError)(401, 'Invalid credentials');
    }
    return {
        user,
        accessToken: (0, jwt_1.generateAccessToken)(user.id),
        refreshToken: (0, jwt_1.generateRefreshToken)(user.id),
    };
};
exports.loginUser = loginUser;
const oauthLogin = async ({ provider, email, firstName, lastName, }) => {
    let user = await User_1.User.findOne({ email: email.toLowerCase() });
    if (!user) {
        user = await User_1.User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            phone: `oauth-${provider}-${Date.now()}`,
            passwordHash: await (0, password_1.hashPassword)((0, uuid_1.v4)()),
            isVerified: true,
        });
    }
    return {
        user,
        accessToken: (0, jwt_1.generateAccessToken)(user.id),
        refreshToken: (0, jwt_1.generateRefreshToken)(user.id),
    };
};
exports.oauthLogin = oauthLogin;
//# sourceMappingURL=auth.service.js.map