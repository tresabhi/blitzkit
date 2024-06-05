import { style } from '@vanilla-extract/css';

export const containerInner = style({
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: 1024,
  padding: '0 16px',

  '@media': {
    'screen and (max-width: 640px)': {
      justifyContent: 'center',
    },
  },
});
