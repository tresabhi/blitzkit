import { Reviews } from '../protos';
import { asset } from './asset';

export async function fetchReviews() {
  const response = await fetch(asset('definitions/reviews.pb'));
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);

  return Reviews.deserializeBinary(array).toObject();
}
