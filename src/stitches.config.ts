import {
  amberDark,
  blueDark,
  slate,
  slateDark,
  tealDark,
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
    ...createColors(tealDark, 'teal'),
  },

  borderStyles: {
    ...createBorderStyles(slateDark),
    ...createBorderStyles(blueDark, undefined, 'blue'),
  },

  durations: {
    regular: '0.2s',
  },
};
