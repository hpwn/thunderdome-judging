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
      // Any chained method (uuid, optional, datetime, min, int, etc.)
      return (..._args: any[]) => prox;
    },
    apply(_target, _thisArg, _args) {
      // In case something tries to call the proxy like a function, just return proxy
      return prox;
    }
  });
  return prox;
};

export const z: any = {
  object: (_shape?: Record<string, any>) => makeChain(),
  string: () => makeChain(),
  number: () => makeChain(),
  boolean: () => makeChain(),
  date: () => makeChain(),
  enum: (_vals: any[]) => makeChain(),
  array: (_arg?: any) => makeChain(),
  union: (_args: any[]) => makeChain(),
  null: () => makeChain(),
  unknown: () => makeChain(),
  record: (_arg?: any) => makeChain(),
};

export default z;
