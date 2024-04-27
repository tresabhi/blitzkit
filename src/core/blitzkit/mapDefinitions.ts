import { asset } from './asset';
import { fetchCdonLz4 } from './fetchCdonLz4';

export interface MapDefinitions {
  [id: number]: {
    id: number;
    name: string;
  };
}

export const mapDefinitions = fetchCdonLz4<MapDefinitions>(
  asset('definitions/maps.cdon.lz4'),
);
