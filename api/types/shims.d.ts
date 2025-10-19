declare module '@prisma/client' {
  export class PrismaClient {}
  export type Event = any;
  export type Division = any;
  export type Heat = any;
  export namespace Prisma {
    type JsonValue = any;
    class PrismaClientKnownRequestError extends Error {
      code: string;
      meta?: any;
    }
  }
}

declare module 'zod' {
  export const z: any;
  export type ZodTypeAny = any;
  const _default: any;
  export default _default;
}
