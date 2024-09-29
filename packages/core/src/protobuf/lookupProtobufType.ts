import protobuf from 'protobufjs';
import average_definitions from '../../protos/average_definitions.proto';
import reviews from '../../protos/reviews.proto';
import tank_definitions from '../../protos/tank_definitions.proto';

export type ProtoSource = keyof typeof protos;

const protos = { reviews, average_definitions, tank_definitions };

export function lookupProtobufType(source: ProtoSource, type: string) {
  return protobuf.parse(protos[source]).root.lookupType(type);
}
