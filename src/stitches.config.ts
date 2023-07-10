import { amberDark, slate, slateDark, slateDarkA } from '@radix-ui/colors';
import { createBorderStyles, createColors } from 'bepaint';

// this isn't really a stitches config, but the object is compliant
export const theme = {
  colors: {
    ...createColors(slateDark),
    ...createColors(slate, 'light'),
    ...createColors(slateDarkA, 'transparent'),
    ...createColors(amberDark, 'amber'),
  },

  borderStyles: createBorderStyles(slateDark),
};
