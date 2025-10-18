import Fastify, { type FastifyInstance } from 'fastify';
import { prisma } from './db/prisma.js';
import { registerDivisionRoutes } from './routes/divisions.js';
import { registerEventRoutes } from './routes/events.js';
import { registerHeatRoutes } from './routes/heats.js';

export function buildServer(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.get('/health', async () => ({ ok: true }));

  app.register(registerEventRoutes);
  app.register(registerDivisionRoutes);
  app.register(registerHeatRoutes);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
