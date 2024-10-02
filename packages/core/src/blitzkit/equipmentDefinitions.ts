import { fetchPB } from '../protobuf';
import { EquipmentDefinitions } from '../protos';
import { asset } from './asset';

export function fetchEquipmentDefinitions() {
  return fetchPB(asset('definitions/equipment.pb'), EquipmentDefinitions);
}
