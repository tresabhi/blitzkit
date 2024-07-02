import { style, styleVariants } from '@vanilla-extract/css';

const MIN_EXPANDED_TOOLS = 752;

export const hamburgerButton = style({
  '@media': {
    [`screen and (min-width: ${MIN_EXPANDED_TOOLS}px)`]: {
      display: 'none',
    },
  },
});

const navbarBase = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 2,
  padding: '1rem',
  backgroundColor: 'var(--color-panel-translucent)',
  backdropFilter: 'blur(4rem)',
  WebkitBackdropFilter: 'blur(4rem)',
  boxSizing: 'border-box',
  transition: 'max-height 0.2s ease-in-out',
  overflow: 'hidden',
});
export const navbar = styleVariants({
  expanded: [
    navbarBase,
    {
      maxHeight: '100%',
    },
  ],
  collapsed: [
    navbarBase,
    {
      maxHeight: 65,
    },
  ],
});

export const toolCard = style({
  boxShadow: `inset 0 -200px 128px -128px var(--color-overlay)`,

  ':hover': {
    boxShadow: `inset 0 -160px 128px -128px #ffffff00`,
  },
});

export const toolTexts = style({
  '@media': {
    [`screen and (max-width: ${MIN_EXPANDED_TOOLS}px)`]: {
      display: 'none',
    },
  },
});
