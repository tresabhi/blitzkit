import type { Theme } from '@nivo/core';

export const nivoTheme = {
  theme: {
    text: { fill: 'var(--gray-11)' },
    grid: { line: { stroke: 'var(--gray-3)' } },
  } satisfies Theme,
  borderRadius: 2,
  innerPadding: 1,
};
