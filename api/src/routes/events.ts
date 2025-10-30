import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
  createEvent,
  deleteEvent,
  getEventById,
  listEvents,
  updateEvent,
} from '../repositories/eventRepository.js';
import { serializeEvent } from './serializers.js';

const jsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.array(jsonValueSchema), z.record(jsonValueSchema)])
);

const eventCreateSchema = z.object({
  name: z.string().min(1),
  startDate: z.union([z.string().datetime({ offset: true }), z.null()]).optional(),
  venue: z.union([z.string().min(1), z.null()]).optional(),
  config: z.union([jsonValueSchema, z.null()]).optional(),
});

const eventUpdateSchema = eventCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one property must be provided',
  });

const eventParamsSchema = z.object({
  eventId: z.string().cuid(),
});

const toDateOrNull = (value: string | null | undefined) =>
  value == null ? value : new Date(value);

export async function registerEventRoutes(app: FastifyInstance) {
  app.get('/events', async () => {
    const events = await listEvents();
    return events.map(serializeEvent);
  });

  app.get('/events/:eventId', async (request, reply) => {
    const parsedParams = eventParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({
        error: 'Invalid event id',
        details: parsedParams.error.flatten(),
      });
    }

    const event = await getEventById(parsedParams.data.eventId);
    if (!event) {
      return reply.status(404).send({ error: 'Event not found' });
    }

    return serializeEvent(event);
  });

  app.post('/events', async (request, reply) => {
    const parsedBody = eventCreateSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.status(400).send({
        error: 'Invalid request body',
        details: parsedBody.error.flatten(),
      });
    }

    const event = await createEvent({
      name: parsedBody.data.name,
      startDate: toDateOrNull(parsedBody.data.startDate),
      venue: parsedBody.data.venue ?? null,
      config: parsedBody.data.config ?? null,
    });

    return reply.status(201).send(serializeEvent(event));
  });

  app.put('/events/:eventId', async (request, reply) => {
    const parsedParams = eventParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({
        error: 'Invalid event id',
        details: parsedParams.error.flatten(),
      });
    }

    const parsedBody = eventUpdateSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({
        error: 'Invalid request body',
        details: parsedBody.error.flatten(),
      });
    }

    const updated = await updateEvent(parsedParams.data.eventId, {
      ...(parsedBody.data.name !== undefined ? { name: parsedBody.data.name } : {}),
      ...(parsedBody.data.startDate !== undefined
        ? { startDate: toDateOrNull(parsedBody.data.startDate) }
        : {}),
      ...(parsedBody.data.venue !== undefined ? { venue: parsedBody.data.venue } : {}),
      ...(parsedBody.data.config !== undefined ? { config: parsedBody.data.config } : {}),
    });

    if (!updated) {
      return reply.status(404).send({ error: 'Event not found' });
    }

    return serializeEvent(updated);
  });

  app.delete('/events/:eventId', async (request, reply) => {
    const parsedParams = eventParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({
        error: 'Invalid event id',
        details: parsedParams.error.flatten(),
      });
    }

    const deleted = await deleteEvent(parsedParams.data.eventId);
    if (!deleted) {
      return reply.status(404).send({ error: 'Event not found' });
    }

    return reply.status(204).send();
  });
}
