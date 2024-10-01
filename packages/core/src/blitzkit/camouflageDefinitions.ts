import { CamouflageDefinitions } from '../protos';
import { fetchPB } from '../types';
import { asset } from './asset';

export function fetchCamouflageDefinitions() {
  return fetchPB(asset('definitions/camoufles.pb'), CamouflageDefinitions);
}
