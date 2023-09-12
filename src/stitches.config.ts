import { amberDark, blueDark, slate, slateDark } from '@radix-ui/colors';
import { createBorderStyles, createColors, createSpaces } from 'bepaint';

// this isn't really a stitches config, but the object is compliant
export const theme = {
  spaces: createSpaces(),

  colors: {
    ...createColors(slateDark),
    ...createColors(slate, 'light'),

    ...createColors(amberDark, 'amber'),
    ...createColors(blueDark, 'blue'),
  },

  borderStyles: createBorderStyles(slateDark),

  durations: {
    regular: '0.2s',
  },
};
