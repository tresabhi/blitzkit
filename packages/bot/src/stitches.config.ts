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

const funnyColors = {
  pink1: crimsonDark.crimson5,
  pink2: crimsonDark.crimson5,
  pink3: crimsonDark.crimson5,
  pink4: crimsonDark.crimson6,
  pink5: crimsonDark.crimson6,
  pink6: crimsonDark.crimson7,
  pink7: crimsonDark.crimson7,
  pink8: crimsonDark.crimson8,
  pink9: crimsonDark.crimson9,
  pink10: crimsonDark.crimson10,
  pink11: crimsonDark.crimson11,
  pink12: crimsonDark.crimson12,
};

// this isn't really a stitches config, but the object is compliant
export const theme = {
  spaces: createSpaces(),

  colors: {
    ...createColors(funnyColors),
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
