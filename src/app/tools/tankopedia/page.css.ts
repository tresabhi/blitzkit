import { style } from '@vanilla-extract/css';
import { theme } from '../../../stitches.config';

export const listing = style({});

export const flag = style({
  transitionDuration: theme.durations.regular,
  left: '0',
  top: '0',
  scale: 1.5,
  opacity: 0.75,

  [`.${listing}:hover &, .${listing}:active &`]: {
    opacity: 1,
  },

  // [`.${listing}:hover &, .${listing}:active &`]: {
  //   transform: 'translateX(-25%)',
  //   filter: 'blur(3rem)',
  // },
});

export const listingShadow = style({
  boxShadow: `inset 64px -80px 64px -64px ${theme.colors.appBackground1}`,

  [`.${listing}:hover &, .${listing}:active &`]: {
    boxShadow: `inset 0 0 0 -64px ${theme.colors.appBackground1}`,
  },
});

export const listingLabel = style({
  transition: `transform ${theme.durations.regular}`,
  transform: 'translateY(0)',

  // [`.${listing}:hover &, .${listing}:active &`]: {
  //   transform: 'translateY(200%)',
  // },
});

export const listingImage = style({
  transition: `transform ${theme.durations.regular}`,
  position: 'absolute',
  left: '50%',
  top: '-25%',

  // [`.${listing}:hover &, .${listing}:active &`]: {
  //   transform: 'translate(-25%, 10%)',
  // },
});

export const alignTopRight = style({
  '@media': {
    'screen and (min-width: 400px)': {
      position: 'absolute',
      right: 16,
      top: 16,
    },

    'screen and (max-width: 399px)': {
      // left: 16,
      // bottom: 16,
    },
  },
});

export const characteristics = style({
  display: 'flex',
  gap: 32,

  '@media': {
    'screen and (max-width: 800px)': {
      flexDirection: 'column',
    },
  },
});

export const configurationChild = style({
  display: 'flex',
  gap: 8,
  flexDirection: 'column',
});

export const configuration = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  flex: 1,
});
