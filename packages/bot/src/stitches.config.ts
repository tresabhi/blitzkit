import {
  amberDark,
  amberDarkA,
  blueDark,
  brownDark,
  crimsonDark,
  greenDark,
  mauveDark,
  orangeDark,
  purpleDark,
  redDark,
  rubyDark,
  sandDark,
  slate,
  slateDark,
  slateDarkA,
  tealDark,
} from '@radix-ui/colors';
import { createBorderStyles, createColors, createSpaces } from 'bepaint';

// this isn't really a stitches config, but the object is compliant
export const theme = {
  spaces: createSpaces(),

  colors: {
    ...createColors(mauveDark),
    ...createColors(slateDarkA, 'alpha'),
    ...createColors(slate, 'light'),

    ...createColors(amberDark, 'amber'),
    ...createColors(amberDarkA, 'amberAlpha'),
    ...createColors(orangeDark, 'orange'),
    ...createColors(purpleDark, 'purple'),
    ...createColors(blueDark, 'blue'),
    ...createColors(tealDark, 'teal'),
    ...createColors(greenDark, 'green'),
    ...createColors(redDark, 'red'),
    ...createColors(brownDark, 'brown'),
    ...createColors(mauveDark, 'mauve'),
    ...createColors(sandDark, 'sand'),
    ...createColors(crimsonDark, 'crimson'),
    ...createColors(rubyDark, 'ruby'),
  },

  borderStyles: {
    subtle: `1px solid ${slateDark.slate2}`,
    ...createBorderStyles(slateDark),
    ...createBorderStyles(blueDark, undefined, 'blue'),
  },

  durations: {
    regular: '0.2s',
  },
};
