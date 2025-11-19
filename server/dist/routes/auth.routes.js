"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/register', upload_1.avatarUpload.single('avatar'), [
    (0, express_validator_1.body)('firstName').isLength({ min: 2 }),
    (0, express_validator_1.body)('lastName').isLength({ min: 2 }),
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('phone').isString().isLength({ min: 6 }),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
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