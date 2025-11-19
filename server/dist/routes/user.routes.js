"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get('/me', auth_1.requireAuth, user_controller_1.meController);
router.put('/me', auth_1.requireAuth, upload_1.avatarUpload.single('avatar'), user_controller_1.updateProfileController);
router.post('/subscription/activate', auth_1.requireAuth, user_controller_1.activateSubscriptionController);
router.post('/subscription/cancel', auth_1.requireAuth, user_controller_1.cancelSubscriptionController);
exports.default = router;
//# sourceMappingURL=user.routes.js.map