import { ConsumableDefinitions } from '../protos';
import { fetchPB } from '../types';
import { asset } from './asset';

export function fetchConsumableDefinitions() {
  return fetchPB(asset('definitions/consumables.pb'), ConsumableDefinitions);
}
