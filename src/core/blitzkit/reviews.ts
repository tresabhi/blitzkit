import { decode } from '../protobuf/decode';
import { asset } from '@blitzkit/core/src/blitzkit/asset';

export interface Reviews {
  reviews: Record<number, Review>;
}

interface Review {
  last_updated: number;
  videos?: Video[];
}

export interface Video {
  id: string;
  author: string;
}

export const reviews = fetch(asset('definitions/reviews.pb'))
  .then((response) => response.arrayBuffer())
  .then((buffer) =>
    decode<Reviews>('reviews', 'blitzkit.Reviews', new Uint8Array(buffer)),
  );
