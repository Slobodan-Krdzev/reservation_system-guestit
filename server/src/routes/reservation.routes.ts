import { Router } from 'express';
import { body } from 'express-validator';
import {
  listReservationsController,
  createReservationController,
  cancelReservationController,
  updateStatusController,
} from '../controllers/reservation.controller';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

const reservationValidation = [
  body('floorplanId').notEmpty(),
  body('tableId').notEmpty(),
  body('tableName').notEmpty(),
  body('date').notEmpty(),
  body('timeSlot').notEmpty(),
  body('guests').isInt({ min: 1 }),
];

router.get('/', requireAuth, listReservationsController);
router.post('/', requireAuth, reservationValidation, validateRequest, createReservationController);
router.delete('/:id', requireAuth, cancelReservationController);
router.patch(
  '/:id/status',
  requireAuth,
  [body('status').isIn(['pending', 'active', 'cancelled', 'finished'])],
  validateRequest,
  updateStatusController,
);

export default router;

