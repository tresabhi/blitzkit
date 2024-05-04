import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'none',

  selectors: {
    '.tank-sandbox-container:hover &': {
      display: 'flex',
    },
  },
});
