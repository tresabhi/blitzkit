import { style } from '@vanilla-extract/css';

const MIN_WIDTH = 640 + 64;

export const hamburger = style({
  display: 'inline-flex',

  '@media': {
    [`screen and (min-width: ${MIN_WIDTH}px)`]: {
      display: 'none',
    },
  },
});

export const tools = style({
  display: 'none',

  '@media': {
    [`screen and (min-width: ${MIN_WIDTH}px)`]: {
      display: 'flex',
    },
  },
});
