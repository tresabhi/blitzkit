import { styleVariants } from '@vanilla-extract/css';
import { theme } from '../stitches.config';

export const tool = styleVariants({
  enabled: {
    boxShadow: `inset 0 -200px 128px -128px ${theme.colors.appBackground1}`,

    ':hover': {
      boxShadow: `inset 0 -160px 128px -128px ${theme.colors.appBackground1}`,
    },
  },
  disabled: {
    boxShadow: `inset 0 -192px 128px -128px ${theme.colors.appBackground1}`,
  },
});
