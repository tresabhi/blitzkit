import { style } from '@vanilla-extract/css';
import { theme } from '../../../stitches.config';

export const listing = style({});

export const listingShadow = style({
  boxShadow: `inset 0 -128px 128px -128px ${theme.colors.appBackground1}`,

  [`.${listing}:hover &, .${listing}:active &`]: {
    boxShadow: `inset 0 0 0 -128px ${theme.colors.appBackground1}`,
  },
});

export const listingLabel = style({
  transition: `transform ${theme.durations.regular}`,
  transform: 'translateY(0)',

  [`.${listing}:hover &, .${listing}:active &`]: {
    transform: 'translateY(200%)',
  },
});

export const listingImage = style({
  transition: `transform ${theme.durations.regular}`,
  transform: 'translateX(25%) translateY(0)',

  [`.${listing}:hover &, .${listing}:active &`]: {
    transform: 'translateX(25%) translateY(10%)',
  },
});
