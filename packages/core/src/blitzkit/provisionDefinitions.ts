import { ProvisionDefinitions } from '../protos';
import { asset } from './asset';

export async function fetchProvisionDefinitions() {
  const response = await fetch(asset('definitions/provisions.pb'));
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);

  return ProvisionDefinitions.deserializeBinary(array).toObject();
}
