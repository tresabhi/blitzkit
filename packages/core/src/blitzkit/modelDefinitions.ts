import { fetchPB } from '../protobuf';
import { ModelDefinitions } from '../protos';
import { asset } from './asset';

export function fetchModelDefinitions() {
  return fetchPB(asset('definitions/models.pb'), ModelDefinitions);
}
