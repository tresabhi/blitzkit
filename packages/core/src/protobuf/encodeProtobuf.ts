import { lookupProtobufType, ProtoSource } from './lookupProtobufType';

export function encodeProtobuf(
  source: ProtoSource,
  type: string,
  data: Record<string, any>,
) {
  const message = lookupProtobufType(source, type);
  const verification = message.verify(data);

  if (verification !== null) throw new Error(verification);

  return message.encode(message.create(data)).finish();
}
