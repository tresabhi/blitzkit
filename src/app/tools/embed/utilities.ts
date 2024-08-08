import {
  EmbedConfig,
  ExtractEmbedConfigTypes,
  RadixColorCompound,
  RadixRadius,
} from '../../../stores/embedState';

export function extractEmbedConfigDefaults<Config extends EmbedConfig>(
  config: Config,
) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.default]),
  ) as ExtractEmbedConfigTypes<Config>;
}

export function toWidthVar(state: number) {
  return `${state}px`;
}

export function toRadiusVar(state: RadixRadius) {
  return `var(--radius-${state})`;
}

export function toColorVar(state: RadixColorCompound) {
  return `var(--${state.base}-${state.variant})`;
}
