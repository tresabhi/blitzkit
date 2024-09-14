import { RadixColorCompound, RadixRadius } from '../../stores/embedState';

export function toWidthVar(state: number) {
  return `${state}px`;
}
export function toRadiusVar(state: RadixRadius) {
  return `var(--radius-${state})`;
}
export function toColorVar(state: RadixColorCompound) {
  return `var(--${state.base}-${state.variant})`;
}
