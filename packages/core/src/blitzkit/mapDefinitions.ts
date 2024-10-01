import { MapDefinitions } from '../protos';
import { fetchPB } from '../types';
import { asset } from './asset';

export function fetchMapDefinitions() {
  return fetchPB(asset('definitions/maps.pb'), MapDefinitions);
}
