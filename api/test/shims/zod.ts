export type ZodTypeAny = any;
const id = <T>(v: T) => v;

export const z: any = {
  object: () => ({ parse: id, safeParse: (v: any) => ({ success: true, data: v }) }),
  string: () => ({}),
  number: () => ({}),
  enum: () => ({}),
  array: () => ({}),
};
export default z;
