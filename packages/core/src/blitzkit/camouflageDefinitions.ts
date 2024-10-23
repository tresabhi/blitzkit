import { fetchPB } from '../protobuf';
import { CamouflageDefinitions } from '../protos';
import { asset } from './asset';

export function fetchCamouflageDefinitions() {
  return fetchPB(asset('definitions/camouflages.pb'), CamouflageDefinitions);
}
