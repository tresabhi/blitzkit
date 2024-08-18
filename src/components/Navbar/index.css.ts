import { style, styleVariants } from '@vanilla-extract/css';

const MIN_WIDTH = 640 + 128;
const HEIGHT = 48;

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

const navbarBase = style({
  // 1px overlap with content to bleed color
  marginBottom: -1,
  backdropFilter: 'blur(4rem) brightness(0.75)',
  WebkitBackdropFilter: 'blur(4rem) brightness(0.75)',
  zIndex: 1,
  transitionDuration: '250ms',

  '@media': {
    [`screen and (min-width: ${MIN_WIDTH}px)`]: {
      maxHeight: HEIGHT,
    },
  },
});

export const navbar = styleVariants({
  false: [
    navbarBase,
    {
      maxHeight: HEIGHT,
    },
  ],
  true: [
    navbarBase,
    {
      maxHeight: '100vh',
    },
  ],
});
