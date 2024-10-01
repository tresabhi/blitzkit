import { MessageFns } from '../protos';

export function encodePB64<Type>(message: MessageFns<Type>, data: Type) {
  return Buffer.from(message.encode(data).finish()).toString('base64');
}
