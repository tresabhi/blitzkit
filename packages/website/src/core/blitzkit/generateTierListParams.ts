export function generateTierListParams(tanks: number[][]) {
  const params = new URLSearchParams();

  tanks.forEach((row, index) => {
    params.set(`row-${index}`, row.join(','));
  });

  return params;
}
