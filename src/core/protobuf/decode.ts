import { lookup, ProtoSource } from './lookup';

export function decode<Type>(
  source: ProtoSource,
  type: string,
  data: Uint8Array,
) {
  return lookup(source, type).decode(data).toJSON() as Type;
}
