import { fetchTankDefinitions } from '@blitzkit/core';
import { useEffect } from 'react';
import { generateTierListParams } from '../../core/blitzkit/generateTierListParams';
import { TierList } from '../../stores/tierList';

const tankDefinitions = await fetchTankDefinitions();

export function URLManager() {
  const tanks = TierList.use((state) => state.tanks);
  const mutateTierList = TierList.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.forEach((value, key) => {
      if (key.startsWith('row-')) {
        const index = Number.parseInt(key.slice(4), 10);
        const values = value
          .split(',')
          .map(Number)
          .filter((id) => id in tankDefinitions.tanks);

        mutateTierList((draft) => {
          draft.tanks[index] = values;
        });
      }
    });
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', `?${generateTierListParams(tanks)}`);
  }, [tanks]);

  return null;
}
