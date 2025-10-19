import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { listDivisions } from '../repositories/divisionRepository.js';
import { serializeDivision } from './serializers.js';

const querySchema = z.object({
  eventId: z.string().uuid().optional(),
});

export async function registerDivisionRoutes(app: FastifyInstance) {
  app.get('/divisions', async (request, reply) => {
    const parsedQuery = querySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsedQuery.error.flatten(),
      });
    }

    const divisions = await listDivisions(parsedQuery.data);
    return divisions.map(serializeDivision);
  });
}
