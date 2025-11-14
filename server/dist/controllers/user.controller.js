"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateSubscriptionController = exports.updateProfileController = exports.meController = void 0;
const User_1 = require("../models/User");
const meController = async (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            phone: req.user.phone,
            avatarUrl: req.user.avatarUrl,
            subscription: req.user.subscription,
        },
    });
};
exports.meController = meController;
const updateProfileController = async (req, res) => {
    const updates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
    };
    if (req.file) {
        updates.avatarUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }
    Object.keys(updates).forEach((key) => {
        if (!updates[key]) {
            delete updates[key];
        }
    });
    const user = await User_1.User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json({ user });
};
exports.updateProfileController = updateProfileController;
const activateSubscriptionController = async (req, res) => {
    const user = await User_1.User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.subscription = {
        tier: 'premium',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    await user.save();
    res.json({
        message: 'Subscription activated (mock). Replace with Stripe integration.',
        subscription: user.subscription,
    });
};
exports.activateSubscriptionController = activateSubscriptionController;
//# sourceMappingURL=user.controller.js.map