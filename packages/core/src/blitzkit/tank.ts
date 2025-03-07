import { fetchPB } from '../protobuf';
import { Tank } from '../protos';
import { asset } from './asset';

export function fetchTank(id: string) {
  return fetchPB(asset(`tanks/${id}/meta.pb`), Tank);
}
