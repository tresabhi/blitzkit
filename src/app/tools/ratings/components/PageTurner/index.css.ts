import { keyframes, style } from '@vanilla-extract/css';

const spinKeyframes = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const infiniteSpin = style({
  animationName: spinKeyframes,
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
  animationDuration: '1s',
});
