import { Router } from 'express';
import {
  meController,
  updateProfileController,
  activateSubscriptionController,
} from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';
import { avatarUpload } from '../middleware/upload';

const router = Router();

router.get('/me', requireAuth, meController);
router.put('/me', requireAuth, avatarUpload.single('avatar'), updateProfileController);
router.post('/subscription/activate', requireAuth, activateSubscriptionController);

export default router;

