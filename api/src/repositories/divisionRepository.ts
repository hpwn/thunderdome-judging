import type { Division } from '@prisma/client';
import { prisma } from '../db/prisma.js';

export type DivisionListFilters = {
  eventId?: string;
};

export async function listDivisions(filters: DivisionListFilters = {}): Promise<Division[]> {
  return prisma.division.findMany({
    where: {
      ...(filters.eventId ? { eventId: filters.eventId } : {}),
    },
    orderBy: {
      order: 'asc',
    },
  });
}
