import { ModelDefinitions } from '../protos';
import { fetchPB } from '../types';
import { asset } from './asset';

export function fetchModelDefinitions() {
  return fetchPB(asset('definitions/models.pb'), ModelDefinitions);
}
