import { Server as SocketIOServer } from 'socket.io';
import { buildServer } from './server.js';

const port = Number.parseInt(process.env.PORT ?? '8080', 10);
const host = process.env.HOST ?? '0.0.0.0';

async function start() {
  const app = buildServer();

  const io = new SocketIOServer(app.server, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? '*',
    },
  });

  io.of('/ws').on('connection', (socket) => {
    app.log.debug({ id: socket.id }, 'client connected to /ws namespace');
  });

  try {
    await app.listen({ port, host });
    app.log.info(`API listening on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
