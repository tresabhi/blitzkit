import { MessageFns } from '../protos';

export function encodePBBuffer<Type>(message: MessageFns<Type>, data: Type) {
  return Buffer.from(message.encode(data).finish());
}
