import { processPendingReservations } from './reservation.service';

let intervalId: NodeJS.Timeout | null = null;

/**
 * Starts the reservation approval scheduler.
 * Checks for pending reservations every 5 seconds and approves those older than 30 seconds.
 */
export const startReservationScheduler = (): void => {
  if (intervalId) {
    // eslint-disable-next-line no-console
    console.warn('Reservation scheduler is already running');
    return;
  }

  // Run immediately on start
  void processPendingReservations();

  // Then run every 5 seconds
  intervalId = setInterval(() => {
    void processPendingReservations();
  }, 5000);

  // eslint-disable-next-line no-console
  console.log('Reservation approval scheduler started (checks every 5 seconds)');
};

/**
 * Stops the reservation approval scheduler.
 */
export const stopReservationScheduler = (): void => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    // eslint-disable-next-line no-console
    console.log('Reservation approval scheduler stopped');
  }
};

