import { style } from '@vanilla-extract/css';

export const bkniIndicator = style({
  scale: 0.8,

  '@media': {
    'screen and (min-width: 1024px)': {
      scale: 1,
    },
  },
});
