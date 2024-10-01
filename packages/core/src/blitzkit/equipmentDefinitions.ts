import { EquipmentDefinitions } from '../protos';
import { fetchPB } from '../types';
import { asset } from './asset';

export function fetchEquipmentDefinitions() {
  return fetchPB(asset('definitions/equipment.pb'), EquipmentDefinitions);
}
