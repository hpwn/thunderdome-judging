export type ZodTypeAny = any;

const makeChain = () => {
  let prox: any;
  const api: any = {
    parse: (v: any) => v,
    safeParse: (v: any) => ({ success: true, data: v }),
  };
  prox = new Proxy(api, {
    get(target, prop) {
      if (prop in target) return (target as any)[prop];
      // For any method like uuid(), optional(), int(), min(), etc.,
      // return a function that returns the proxy again (so chaining continues).
      return (..._args: any[]) => prox;
    },
  });
  return prox;
};

export const z: any = {
  object: () => makeChain(),
  string: () => makeChain(),
  number: () => makeChain(),
  enum: (_vals: any[]) => makeChain(),
  array: (_arg?: any) => makeChain(),
};

export default z;
