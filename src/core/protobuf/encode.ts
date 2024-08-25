import { lookup } from './lookup';

export async function encode(proto: string, data: any) {
  const Message = await lookup(proto);
  const verification = Message.verify(data);

  if (verification !== null) throw new Error(verification);

  return Message.encode(Message.create(data)).finish();
}
