"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
exports.mailer = nodemailer_1.default.createTransport({
    host: env_1.env.smtpHost,
    port: env_1.env.smtpPort,
    secure: env_1.env.smtpPort === 465,
    auth: {
        user: env_1.env.smtpUser,
        pass: env_1.env.smtpPass,
    },
});
const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${env_1.env.frontendUrl}/auth/verify?token=${token}`;
    const message = {
        from: env_1.env.smtpFromEmail,
        to: email,
        subject: 'Verify your Reservation System account',
        text: `Please verify your account by visiting: ${verifyUrl}`,
        html: `<p>Please verify your account by clicking <a href="${verifyUrl}">here</a>.</p>`,
    };
    try {
        await exports.mailer.sendMail(message);
    }
    catch (error) {
        // For development, log the URL even if mail fails
        // eslint-disable-next-line no-console
        console.warn('Failed to send email via SMTP, logging verification URL instead:', verifyUrl);
    }
    // Always log token for development
    // eslint-disable-next-line no-console
    console.log(`Verification token for ${email}: ${verifyUrl}`);
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=mailer.js.map