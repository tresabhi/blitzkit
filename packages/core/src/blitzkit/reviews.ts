import { asset } from '@blitzkit/core/src/blitzkit/asset';
import { decodeProtobuf } from '../protobuf';

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
    decodeProtobuf<Reviews>(
      'reviews',
      'blitzkit.Reviews',
      new Uint8Array(buffer),
    ),
  );
