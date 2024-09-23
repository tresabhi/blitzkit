import protobuf from 'protobufjs';
import average_definitions from '../../protos/average_definitions.proto?raw';
import reviews from '../../protos/reviews.proto?raw';

export type ProtoSource = keyof typeof protos;

const protos = { reviews, average_definitions };

export function lookupProtobufType(source: ProtoSource, type: string) {
  return protobuf.parse(protos[source]).root.lookupType(type);
}
