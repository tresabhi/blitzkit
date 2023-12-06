import { style } from '@vanilla-extract/css';

export const splitFilters = style({
  '@media': {
    'screen and (min-width: 513px)': {
      display: 'none',
    },
  },
});

export const oneLineFilters = style({
  '@media': {
    'screen and (max-width: 512px)': {
      display: 'none',
    },
  },
});
