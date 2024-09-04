import { parse } from 'protobufjs';
import average_definitions from '../../../public/protos/average_definitions.proto';
import reviews from '../../../public/protos/reviews.proto';

export type ProtoSource = keyof typeof protos;

const protos = { reviews, average_definitions };

export function lookup(source: ProtoSource, type: string) {
  return parse(protos[source]).root.lookupType(type);
}
