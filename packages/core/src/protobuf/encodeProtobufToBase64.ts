import { encodeProtobuf } from './encodeProtobuf';
import { ProtoSource } from './lookupProtobufType';

export async function encodeProtobufToBase64(
  source: ProtoSource,
  type: string,
  data: any,
) {
  const array = encodeProtobuf(source, type, data);
  return Buffer.from(array).toString('base64');
}
