import { EmbedConfig, ExtractEmbedConfigType } from './types';

export function extractEmbedConfigDefaults<Config extends EmbedConfig>(
  config: Config,
) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.default]),
  ) as ExtractEmbedConfigType<Config>;
}
