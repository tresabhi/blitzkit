import { fetchPB } from '../protobuf';
import { ConsumableDefinitions } from '../protos';
import { asset } from './asset';

export function fetchConsumableDefinitions() {
  return fetchPB(asset('definitions/consumables.pb'), ConsumableDefinitions);
}
