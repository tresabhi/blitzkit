import {
  EmbedConfig,
  ExtractEmbedConfigType,
  RadixColor,
  RadixRadius,
} from './types';

export function extractEmbedConfigDefaults<Config extends EmbedConfig>(
  config: Config,
) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.default]),
  ) as ExtractEmbedConfigType<Config>;
}

export function toWidthVar(state: number) {
  return `${state}px`;
}

export function toRadiusVar(state: RadixRadius) {
  return `var(--radius-${state})`;
}

export function toColorVar(state: RadixColor) {
  return `var(--${state.base}-${state.variant})`;
}
