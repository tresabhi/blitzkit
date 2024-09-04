import { lookup, ProtoSource } from './lookup';

export function encode(
  source: ProtoSource,
  type: string,
  data: Record<string, any>,
) {
  const message = lookup(source, type);
  const verification = message.verify(data);

  if (verification !== null) throw new Error(verification);

  return message.encode(message.create(data)).finish();
}
