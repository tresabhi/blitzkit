import type { Theme } from '@nivo/core';
import { Var } from '../radix/var';

export const nivoTheme = {
  background: Var('color-background'),
  text: {
    fill: Var('gray-contrast'),
    fontFamily: 'inherit',
  },
  axis: {
    ticks: {
      text: {
        fill: Var('gray-indicator'),
      },
      line: {
        stroke: Var('gray-indicator'),
      },
    },
  },
  grid: {
    line: {
      stroke: Var('gray-indicator'),
    },
  },
  tooltip: {
    container: {
      background: Var('color-overlay'),
      backdropFilter: 'blur(4rem)',
      WebkitBackdropFilter: 'blur(4rem)',
      color: Var('gray-contrast'),
      borderRadius: Var('radius-2'),
    },
  },
  labels: {
    text: {
      fill: Var('gray-1'),
    },
  },
} satisfies Theme;
