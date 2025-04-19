import { fetchPB } from '../protobuf';
import { PopularTanks } from '../protos';
import { asset } from './asset';

export function fetchPopularTanks() {
  return fetchPB(asset('definitions/popular-tanks.pb'), PopularTanks);
}
