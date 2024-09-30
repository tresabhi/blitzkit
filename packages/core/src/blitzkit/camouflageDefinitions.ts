import { CamouflageDefinitions } from '../protos';
import { asset } from './asset';

export async function fetchCamouflageDefinitions() {
  const response = await fetch(asset('definitions/camoufles.pb'));
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);

  return CamouflageDefinitions.deserializeBinary(array).toObject();
}
