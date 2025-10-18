import type { Division, Event, Heat } from '@prisma/client';

export type EventWithRelations = Event & {
  divisions?: (Division & { heats?: Heat[] })[];
};

export type DivisionWithRelations = Division & { heats?: Heat[] };

const toIsoString = (value: Date | null | undefined) =>
  value instanceof Date ? value.toISOString() : null;

export function serializeHeat(heat: Heat) {
  return {
    id: heat.id,
    divisionId: heat.divisionId,
    name: heat.name,
    order: heat.order,
    status: heat.status,
    createdAt: heat.createdAt.toISOString(),
    updatedAt: heat.updatedAt.toISOString(),
  };
}

export function serializeDivision(division: DivisionWithRelations) {
  return {
    id: division.id,
    eventId: division.eventId,
    name: division.name,
    order: division.order,
    createdAt: division.createdAt.toISOString(),
    updatedAt: division.updatedAt.toISOString(),
    heats: division.heats?.map(serializeHeat),
  };
}

export function serializeEvent(event: EventWithRelations) {
  return {
    id: event.id,
    name: event.name,
    startDate: toIsoString(event.startDate),
    venue: event.venue,
    config: event.config ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    divisions: event.divisions?.map(serializeDivision),
  };
}
