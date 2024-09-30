import { ModelDefinitions } from '../protos';
import { asset } from './asset';

export async function fetchModelDefinitions() {
  const response = await fetch(asset('definitions/models.pb'));
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);

  return ModelDefinitions.deserializeBinary(array).toObject();
}
