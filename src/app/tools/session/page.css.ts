import { style } from '@vanilla-extract/css';
import { theme } from '../../../stitches.config';

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

export const toolbarButton = style({
  '@media': {
    'screen and (min-width: 640px)': {
      flex: 0,
    },
  },

  flex: 1,
});

export const searchButton = style({
  border: 'none',
  background: 'none',
  fontSize: 16,
  display: 'flex',
  padding: 8,
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',

  ':hover': {
    backgroundColor: theme.colors.componentInteractiveHover,
    borderRadius: 4,
  },
});
