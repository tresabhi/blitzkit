import { asset, fetchCdonLz4 } from '@blitzkit/core';

export interface MapDefinitions {
  [id: number]: {
    id: number;
    name: string;
  };
}

export const mapDefinitions = fetchCdonLz4<MapDefinitions>(
  asset('definitions/maps.cdon.lz4'),
);
