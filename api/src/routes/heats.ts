import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { listHeats } from '../repositories/heatRepository.js';
import { serializeHeat } from './serializers.js';

const querySchema = z.object({
  divisionId: z.string().cuid().optional(),
  eventId: z.string().cuid().optional(),
});

export async function registerHeatRoutes(app: FastifyInstance) {
  app.get('/heats', async (request, reply) => {
    const parsedQuery = querySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsedQuery.error.flatten(),
      });
    }

    const heats = await listHeats(parsedQuery.data);
    return heats.map(serializeHeat);
  });
}
