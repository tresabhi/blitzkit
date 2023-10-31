import { style } from '@vanilla-extract/css';

export const noArrows = style({
  '::-webkit-progress-inner-value': {
    appearance: 'none',
    display: 'none',
    margin: 0,
  },
});
