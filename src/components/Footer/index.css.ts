import { style } from '@vanilla-extract/css';

export const containerInner = style({
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: 800,
  padding: '0 16px',

  '@media': {
    'screen and (max-width: 640px)': {
      justifyContent: 'center',
    },
  },
});
