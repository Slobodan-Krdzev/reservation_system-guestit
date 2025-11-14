import { Router } from 'express';
import {
  listFloorplansController,
  floorplanAvailabilityController,
} from '../controllers/floorplan.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, listFloorplansController);
router.get('/:id/availability', requireAuth, floorplanAvailabilityController);

export default router;

