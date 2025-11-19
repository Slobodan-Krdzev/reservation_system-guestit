import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listUnreadNotificationsController } from '../controllers/notification.controller';

const router = Router();

router.get('/', requireAuth, listUnreadNotificationsController);

export default router;


