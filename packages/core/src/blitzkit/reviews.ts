import { fetchPB } from '../protobuf';
import { Reviews } from '../protos';
import { asset } from './asset';

export function fetchReviews() {
  return fetchPB(asset('definitions/reviews.pb'), Reviews);
}
