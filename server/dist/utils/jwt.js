"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateAccessToken = (userId) => {
    const expiresIn = env_1.env.jwtExpiresIn;
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign({ sub: userId, type: 'access' }, env_1.env.jwtSecret, options);
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    const expiresIn = env_1.env.refreshExpiresIn;
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign({ sub: userId, type: 'refresh' }, env_1.env.refreshSecret, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
};
exports.verifyAccessToken = verifyAccessToken;
//# sourceMappingURL=jwt.js.map