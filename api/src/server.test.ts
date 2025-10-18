import { beforeAll, afterAll, beforeEach, afterEach, describe, expect, it } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';
import { buildServer } from './server.js';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';

let container: PostgreSqlContainer | undefined;
let app: FastifyInstance | undefined;
let prisma: PrismaClient | undefined;
let skipSuite = false;

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

async function clearDatabase() {
  if (!prisma) {
    return;
  }

  await prisma.score.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.run.deleteMany();
  await prisma.heat.deleteMany();
  await prisma.judge.deleteMany();
  await prisma.skater.deleteMany();
  await prisma.division.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.event.deleteMany();
}

beforeAll(async function () {
  const externalDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

  if (externalDatabaseUrl) {
    process.env.DATABASE_URL = externalDatabaseUrl;
  } else {
    try {
      container = await new PostgreSqlContainer('postgres:16-alpine')
        .withDatabase('thunderdome')
        .withUsername('postgres')
        .withPassword('postgres')
        .start();
      process.env.DATABASE_URL = container.getConnectionUri();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Could not find a working container runtime strategy')
      ) {
        skipSuite = true;
        console.warn('Skipping integration tests: no container runtime available');
        return;
      }

      throw error;
    }
  }

  execSync('pnpm db:migrate:pg', {
    cwd: rootDir,
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'inherit',
  });

  const prismaModule = await import('./db/prisma.js');
  prisma = prismaModule.prisma;
});

beforeEach(async function () {
  if (skipSuite) {
    return;
  }

  await clearDatabase();
  app = buildServer();
});

afterEach(async () => {
  if (app) {
    await app.close();
    app = undefined;
  }
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }

  if (container) {
    await container.stop();
  }
});

describe('health check', () => {
  it('returns ok', async () => {
    if (skipSuite || !app) {
      return;
    }

    const response = await request(app.server).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});

describe('events API', () => {
  it('creates and lists events', async () => {
    if (skipSuite || !app) {
      return;
    }

    const created = await request(app.server).post('/events').send({
      name: 'NAFSA Demo',
      startDate: '2024-09-01T00:00:00.000Z',
      venue: 'Brooklyn',
    });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      id: expect.any(String),
      name: 'NAFSA Demo',
      startDate: '2024-09-01T00:00:00.000Z',
      venue: 'Brooklyn',
    });

    const list = await request(app.server).get('/events');
    expect(list.status).toBe(200);
    expect(list.body).toEqual([
      expect.objectContaining({
        id: created.body.id,
        name: 'NAFSA Demo',
        venue: 'Brooklyn',
        startDate: '2024-09-01T00:00:00.000Z',
      }),
    ]);
  });

  it('returns a single event with divisions and heats', async () => {
    if (skipSuite || !app || !prisma) {
      return;
    }

    const event = await prisma.event.create({
      data: {
        name: 'Qualifier',
        startDate: new Date('2024-10-01T00:00:00.000Z'),
        venue: 'Los Angeles',
        divisions: {
          create: {
            name: 'Pro Division',
            order: 1,
            heats: {
              create: [
                { name: 'Heat A', order: 1 },
                { name: 'Heat B', order: 2 },
              ],
            },
          },
        },
      },
      include: {
        divisions: {
          include: { heats: true },
        },
      },
    });

    const response = await request(app.server).get(`/events/${event.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: event.id,
      name: 'Qualifier',
      divisions: [
        {
          name: 'Pro Division',
          heats: [
            expect.objectContaining({ name: 'Heat A' }),
            expect.objectContaining({ name: 'Heat B' }),
          ],
        },
      ],
    });
  });

  it('updates an event', async () => {
    if (skipSuite || !app || !prisma) {
      return;
    }

    const event = await prisma.event.create({
      data: {
        name: 'Original',
        startDate: new Date('2024-05-01T00:00:00.000Z'),
      },
    });

    const response = await request(app.server).put(`/events/${event.id}`).send({
      name: 'Updated Event',
      venue: 'San Diego',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: event.id,
      name: 'Updated Event',
      venue: 'San Diego',
    });
  });

  it('deletes an event', async () => {
    if (skipSuite || !app || !prisma) {
      return;
    }

    const event = await prisma.event.create({
      data: {
        name: 'To Delete',
      },
    });

    const response = await request(app.server).delete(`/events/${event.id}`);
    expect(response.status).toBe(204);

    const getResponse = await request(app.server).get(`/events/${event.id}`);
    expect(getResponse.status).toBe(404);
  });
});

describe('divisions API', () => {
  it('lists divisions by event', async () => {
    if (skipSuite || !app || !prisma) {
      return;
    }

    const event = await prisma.event.create({
      data: {
        name: 'Qualifier',
        divisions: {
          create: [
            { name: 'Amateur', order: 1 },
            { name: 'Pro', order: 2 },
          ],
        },
      },
    });

    const response = await request(app.server).get('/divisions').query({ eventId: event.id });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({ name: 'Amateur' });
    expect(response.body[1]).toMatchObject({ name: 'Pro' });
  });
});

describe('heats API', () => {
  it('lists heats for a division', async () => {
    if (skipSuite || !app || !prisma) {
      return;
    }

    const event = await prisma.event.create({
      data: {
        name: 'Qualifier',
        divisions: {
          create: {
            name: 'Pro',
            heats: {
              create: [
                { name: 'Heat 1', order: 1 },
                { name: 'Heat 2', order: 2 },
              ],
            },
          },
        },
      },
      include: {
        divisions: {
          include: { heats: true },
        },
      },
    });

    const division = event.divisions[0]!;

    const response = await request(app.server).get('/heats').query({ divisionId: division.id });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({ name: 'Heat 1' });
    expect(response.body[1]).toMatchObject({ name: 'Heat 2' });
  });
});
