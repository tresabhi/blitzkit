import { fetchPB } from '../protobuf';
import { ProvisionDefinitions } from '../protos';
import { asset } from './asset';

export function fetchProvisionDefinitions() {
  return fetchPB(asset('definitions/provisions.pb'), ProvisionDefinitions);
}
