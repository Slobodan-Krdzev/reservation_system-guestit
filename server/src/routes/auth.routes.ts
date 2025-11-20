import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerController,
  verifyController,
  loginController,
  oauthController,
  refreshController,
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { avatarUpload } from '../middleware/upload';

const router = Router();

// Middleware to handle avatar upload only if Content-Type is multipart/form-data
const handleAvatarUpload = (req: any, res: any, next: any) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return avatarUpload.single('avatar')(req, res, next);
  }
  next();
};

router.post(
  '/register',
  handleAvatarUpload,
  [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').trim().isEmail().withMessage('Invalid email address'),
    body('phone').trim().isString().isLength({ min: 6 }).withMessage('Phone must be at least 6 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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
router.post('/refresh', refreshController);

export default router;

