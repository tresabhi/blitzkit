import { ConsumableDefinitions } from '../protos';
import { asset } from './asset';

export async function fetchConsumableDefinitions() {
  const response = await fetch(asset('definitions/consumables.pb'));
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);

  return ConsumableDefinitions.deserializeBinary(array).toObject();
}
