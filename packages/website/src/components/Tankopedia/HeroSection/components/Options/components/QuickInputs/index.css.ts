import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'none',

  ':focus-within': {
    display: 'flex',
  },

  selectors: {
    '.tank-sandbox-container:hover &': {
      display: 'flex',
    },
  },
});
