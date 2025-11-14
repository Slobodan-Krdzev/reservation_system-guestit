import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerController,
  verifyController,
  loginController,
  oauthController,
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { avatarUpload } from '../middleware/upload';

const router = Router();

router.post(
  '/register',
  avatarUpload.single('avatar'),
  [
    body('firstName').isLength({ min: 2 }),
    body('lastName').isLength({ min: 2 }),
    body('email').isEmail(),
    body('phone').isString().isLength({ min: 6 }),
    body('password').isLength({ min: 6 }),
    validateRequest,
  ],
  registerController,
);

router.get('/verify', verifyController);

router.post('/login', [
  body('identifier').notEmpty(),
  body('password').notEmpty(),
  validateRequest,
  loginController,
]);

router.post('/oauth', oauthController);

export default router;

