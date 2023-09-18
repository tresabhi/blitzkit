import {
  amberDark,
  blueDark,
  slate,
  slateDark,
  tomatoDark,
} from '@radix-ui/colors';
import { createBorderStyles, createColors, createSpaces } from 'bepaint';

// this isn't really a stitches config, but the object is compliant
export const theme = {
  spaces: createSpaces(),

  colors: {
    ...createColors(slateDark),
    ...createColors(slate, 'light'),

    ...createColors(amberDark, 'amber'),
    ...createColors(blueDark, 'blue'),
    ...createColors(tomatoDark, 'red'),
  },

  borderStyles: {
    ...createBorderStyles(slateDark),
    ...createBorderStyles(blueDark, undefined, 'blue'),
    ...createBorderStyles(tomatoDark, undefined, 'red'),
  },

  durations: {
    regular: '0.2s',
  },
};
