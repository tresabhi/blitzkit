import { ProvisionDefinitions } from '../protos';
import { fetchPB } from '../types';
import { asset } from './asset';

export function fetchProvisionDefinitions() {
  return fetchPB(asset('definitions/provisions.pb'), ProvisionDefinitions);
}
