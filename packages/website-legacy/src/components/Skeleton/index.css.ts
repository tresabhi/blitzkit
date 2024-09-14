import { slateDarkA } from '@radix-ui/colors';
import { keyframes, style } from '@vanilla-extract/css';

const animation = keyframes({
  '0%': { backgroundColor: slateDarkA.slateA2 },
  '50%': { backgroundColor: slateDarkA.slateA3 },
  '100%': { backgroundColor: slateDarkA.slateA2 },
});

export const skeleton = style({
  borderRadius: 8,
  animation: `${animation} 2s ease-in-out infinite`,
});
