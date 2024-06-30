import { lookup } from './lookup';

export async function decode<Type>(proto: string, data: Uint8Array) {
  const Message = await lookup(proto);
  return Message.decode(data).toJSON() as Type;
}
