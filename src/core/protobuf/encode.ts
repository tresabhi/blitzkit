import { lookup } from './lookup';

export async function encode(proto: string, data: any) {
  const Message = await lookup(proto);
  return Message.encode(Message.create(data)).finish();
}
