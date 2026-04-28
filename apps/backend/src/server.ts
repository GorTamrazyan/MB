import 'dotenv/config';
import './config/env'; // validate env first
import { createApp } from './app';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { env } from './config/env';
import { startViewFlush } from './modules/services/services.service';

async function main() {
  await redis.connect();
  await prisma.$connect();

  const app = createApp();
  startViewFlush();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
