import type { Heat } from '@prisma/client';
import { prisma } from '../db/prisma.js';

export type HeatListFilters = {
  divisionId?: string;
  eventId?: string;
};

export async function listHeats(filters: HeatListFilters = {}): Promise<Heat[]> {
  return prisma.heat.findMany({
    where: {
      ...(filters.divisionId ? { divisionId: filters.divisionId } : {}),
      ...(filters.eventId
        ? {
            division: {
              eventId: filters.eventId,
            },
          }
        : {}),
    },
    orderBy: {
      order: 'asc',
    },
  });
}
