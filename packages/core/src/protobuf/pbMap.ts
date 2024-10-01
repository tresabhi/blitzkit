export type PBMap<T> = T[keyof T] extends number ? T[keyof T] : never;
