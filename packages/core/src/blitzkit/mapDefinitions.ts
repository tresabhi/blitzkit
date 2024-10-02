import { fetchPB } from '../protobuf';
import { MapDefinitions } from '../protos';
import { asset } from './asset';

export function fetchMapDefinitions() {
  return fetchPB(asset('definitions/maps.pb'), MapDefinitions);
}
