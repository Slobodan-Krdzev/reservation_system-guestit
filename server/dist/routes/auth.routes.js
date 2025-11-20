"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Middleware to handle avatar upload only if Content-Type is multipart/form-data
const handleAvatarUpload = (req, res, next) => {
    if (req.headers['content-type']?.includes('multipart/form-data')) {
        return upload_1.avatarUpload.single('avatar')(req, res, next);
    }
    next();
};
router.post('/register', handleAvatarUpload, [
    (0, express_validator_1.body)('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    (0, express_validator_1.body)('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('phone').trim().isString().isLength({ min: 6 }).withMessage('Phone must be at least 6 characters'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest_1.validateRequest,
], auth_controller_1.registerController);
router.get('/verify', auth_controller_1.verifyController);
router.post('/login', [
    (0, express_validator_1.body)('identifier').notEmpty(),
    (0, express_validator_1.body)('password').notEmpty(),
    validateRequest_1.validateRequest,
    auth_controller_1.loginController,
]);
router.post('/oauth', auth_controller_1.oauthController);
router.post('/refresh', auth_controller_1.refreshController);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map