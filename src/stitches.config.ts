import { amberDark, blueDark, slate, slateDark } from '@radix-ui/colors';
import { createBorderStyles, createColors } from 'bepaint';

// this isn't really a stitches config, but the object is compliant
export const theme = {
  colors: {
    ...createColors(slateDark),
    ...createColors(slate, 'light'),

    ...createColors(amberDark, 'amber'),
    ...createColors(blueDark, 'blue'),
  },

  borderStyles: createBorderStyles(slateDark),
};
