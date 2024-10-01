import { Reviews } from '../protos';
import { fetchPB } from '../types';
import { asset } from './asset';

export function fetchReviews() {
  return fetchPB(asset('definitions/reviews.pb'), Reviews);
}
