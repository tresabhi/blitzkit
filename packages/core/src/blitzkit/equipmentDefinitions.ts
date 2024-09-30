import { EquipmentDefinitions } from '../protos';
import { asset } from './asset';

export async function fetchEquipmentDefinitions() {
  const response = await fetch(asset('definitions/equipment.pb'));
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);

  return EquipmentDefinitions.deserializeBinary(array).toObject();
}
