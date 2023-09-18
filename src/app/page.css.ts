import { style } from '@vanilla-extract/css';
import { theme } from '../stitches.config';

export const tool = style({
  height: 128,
  minWidth: 256,
  flex: 1,
  borderRadius: 4,
  textDecoration: 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  padding: 16,
  gap: 4,
  boxShadow: `inset 0 -192px 128px -128px ${theme.colors.appBackground1}`,
  transition: `box-shadow ${theme.durations.regular}`,

  ':hover': {
    boxShadow: `inset 0 -128px 128px -128px ${theme.colors.appBackground1}`,
  },
});
