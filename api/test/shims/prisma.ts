export class PrismaClient {
  event = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (args: any) => ({ id: 'mock-event', ...(args?.data ?? {}) })
  };
  division = {
    findMany: async () => [],
    create: async (args: any) => ({ id: 'mock-division', ...(args?.data ?? {}) })
  };
  heat = {
    findMany: async () => [],
    create: async (args: any) => ({ id: 'mock-heat', ...(args?.data ?? {}) })
  };
  async $disconnect() {}
}

export const Prisma = {
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: any;
    constructor(message = 'mock', code = 'P000', meta?: any) {
      super(message);
      this.code = code;
      this.meta = meta;
    }
  }
};
