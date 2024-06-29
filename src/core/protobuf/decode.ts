import { lookup } from './lookup';

export async function decode(proto: string, data: Uint8Array) {
  const Message = await lookup(proto);
  return Message.decode(data).toJSON();
}
