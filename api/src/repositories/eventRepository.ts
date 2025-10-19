import { Prisma } from '@prisma/client';
import type { Event } from '@prisma/client';
import { prisma } from '../db/prisma.js';

export type EventCreateInput = {
  name: string;
  startDate?: Date | null;
  venue?: string | null;
  config?: Prisma.JsonValue | null;
};

export type EventUpdateInput = Partial<EventCreateInput>;

export async function listEvents(): Promise<Event[]> {
  return prisma.event.findMany({
    orderBy: { createdAt: 'asc' },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      divisions: {
        orderBy: { order: 'asc' },
        include: {
          heats: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
}

export async function createEvent(input: EventCreateInput) {
  return prisma.event.create({
    data: {
      name: input.name,
      startDate: input.startDate ?? null,
      venue: input.venue ?? null,
      config: input.config ?? null,
    },
  });
}

export async function updateEvent(id: string, input: EventUpdateInput) {
  try {
    return await prisma.event.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
        ...(input.venue !== undefined ? { venue: input.venue } : {}),
        ...(input.config !== undefined ? { config: input.config } : {}),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }

    throw error;
  }
}

export async function deleteEvent(id: string) {
  try {
    await prisma.event.delete({ where: { id } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return false;
    }

    throw error;
  }
}
