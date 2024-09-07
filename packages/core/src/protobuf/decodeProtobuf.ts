import { lookupProtobufType, ProtoSource } from './lookupProtobufType';

export function decodeProtobuf<Type>(
  source: ProtoSource,
  type: string,
  data: Uint8Array,
) {
  return lookupProtobufType(source, type).decode(data).toJSON() as Type;
}
