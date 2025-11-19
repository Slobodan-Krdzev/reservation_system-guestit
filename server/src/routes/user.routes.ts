import { Router } from 'express';
import {
  meController,
  updateProfileController,
  activateSubscriptionController,
  cancelSubscriptionController,
} from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';
import { avatarUpload } from '../middleware/upload';

const router = Router();

router.get('/me', requireAuth, meController);
router.put('/me', requireAuth, avatarUpload.single('avatar'), updateProfileController);
router.post('/subscription/activate', requireAuth, activateSubscriptionController);
router.post('/subscription/cancel', requireAuth, cancelSubscriptionController);

export default router;

