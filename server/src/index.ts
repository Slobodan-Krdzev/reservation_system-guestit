import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

const bootstrap = async () => {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${env.port}`);
  });
};

void bootstrap();

