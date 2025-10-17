import 'dotenv/config';

import { Server as SocketIOServer } from 'socket.io';
import { buildServer } from './server.js';

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? '0.0.0.0';
const allowedOrigins =
  process.env.WS_ALLOW_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) ?? [];

async function start() {
  const app = buildServer();

  const io = new SocketIOServer(app.server, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    },
  });

  io.of('/ws').on('connection', (socket) => {
    app.log.debug({ id: socket.id }, 'client connected to /ws namespace');
  });

  try {
    await app.listen({ port: PORT, host: HOST });
    const address = app.server.address();
    if (typeof address === 'object' && address) {
      app.log.info({ host: address.address, port: address.port }, 'API listening');
    } else {
      app.log.info(`API listening on http://${HOST}:${PORT}`);
    }
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
