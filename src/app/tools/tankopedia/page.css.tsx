import { style } from '@vanilla-extract/css';
import { theme } from '../../../stitches.config';

export const listing = style({
  transition: `background-position ${theme.durations.regular}`,

  backgroundPosition: 'left center',

  ':hover': {
    backgroundPosition: '-256px center',
  },
});

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
  position: 'absolute',
  left: '50%',

  [`.${listing}:hover &, .${listing}:active &`]: {
    transform: 'translate(-25%, 10%)',
  },
});
