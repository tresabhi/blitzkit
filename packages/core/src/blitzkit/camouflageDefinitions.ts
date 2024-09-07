import { asset } from '@blitzkit/core/src/blitzkit/asset';
import { fetchCdonLz4 } from '@blitzkit/core/src/blitzkit/fetchCdonLz4';

export type CamouflageDefinitions = Record<
  number,
  {
    id: number;
    name: string;
    tankName?: string;
    tankNameFull?: string;
  }
>;

export const camouflageDefinitions = fetchCdonLz4<CamouflageDefinitions>(
  asset('definitions/camouflages.cdon.lz4'),
);
