export type ZodTypeAny = any;

const chain = () => {
  const api: any = {
    parse: (v: any) => v,
    safeParse: (v: any) => ({ success: true, data: v }),
  };
  // Return a proxy where ANY accessed method returns the same chain (for uuid(), optional(), int(), min(), etc.)
  return new Proxy(api, {
    get(target, prop) {
      if (prop in target) return (target as any)[prop];
      return (..._args: any[]) => target; // chainables
    },
  });
};

export const z: any = {
  object: () => chain(),
  string: () => chain(),
  number: () => chain(),
  enum: (_vals: any[]) => chain(),
  array: (_arg?: any) => chain(),
};

export default z;
