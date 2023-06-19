import { slate, slateDark } from '@radix-ui/colors';
import { createColors } from 'bepaint';

// this isn't really a stitches config, but the object is compliant
export const theme = { colors: createColors(slateDark) };
export const themeLight = { colors: createColors(slate) };
