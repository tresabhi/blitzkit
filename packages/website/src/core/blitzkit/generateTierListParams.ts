import type { TierList } from '../../stores/tierList';

export function generateTierListParams(rows: TierList['rows']) {
  const params = new URLSearchParams();

  rows.forEach((row, index) => {
    params.set(`row-${index}`, row.tanks.join(','));
  });

  return params;
}
