import { keyframes, style } from '@vanilla-extract/css';

const fadeOutBorder = keyframes({
  from: {
    outline: '1rem solid #ff0000ff',
  },
  to: {
    outline: '1rem solid #ff000000',
  },
});

export const animated = style({
  animation: `${fadeOutBorder} 0.5s linear`,

  ':hover': {
    outline: '1rem solid #ff000080',
  },
});
