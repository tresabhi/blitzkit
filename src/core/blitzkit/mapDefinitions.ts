import { asset } from '@blitzkit/core/src/blitzkit/asset';
import { fetchCdonLz4 } from '@blitzkit/core/src/blitzkit/fetchCdonLz4';

export interface MapDefinitions {
  [id: number]: {
    id: number;
    name: string;
  };
}

export const mapDefinitions = fetchCdonLz4<MapDefinitions>(
  asset('definitions/maps.cdon.lz4'),
);
