import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { startReservationScheduler } from './services/scheduler.service';

const bootstrap = async () => {
  await connectDb();
  const app = createApp();
  app.listen(env.port, '0.0.0.0',() => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://0.0.0.0:${env.port}`);
  });

  // Start the demo reservation approval scheduler
  startReservationScheduler();
};

void bootstrap();

