import { style } from '@vanilla-extract/css';

export const toolBar = style({
  '@media': {
    'screen and (min-width: 640px)': {
      flexDirection: 'row',
    },
  },

  flexDirection: 'column',
  display: 'flex',
  gap: 8,
});

export const button = style({
  '@media': {
    'screen and (min-width: 640px)': {
      flex: 0,
    },
  },

  flex: 1,
});
