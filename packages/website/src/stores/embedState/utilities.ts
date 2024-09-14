import { TextProps } from '@radix-ui/themes';
import { EmbedConfig } from '.';
import * as EmbedState from './';
import { EmbedConfigItemType, EmbedItemType } from './constants';

export function useEmbedStateCurry<Config extends EmbedConfig>() {
  function useState<Key extends keyof Config>(key: Key) {
    return EmbedState.use((state) => {
      return (state as EmbedState.ExtractEmbedConfigTypes<Config>)[key];
    });
  }

  function useRichText<
    Key extends {
      [K in keyof Config]: Config[K] extends { type: EmbedItemType.RichText }
        ? K
        : never;
    }[keyof Config],
  >(key: Key) {
    const { color, ...state } = useState(
      key,
    ) as EmbedConfigItemType<EmbedItemType.RichText>['default'];

    return {
      style: { color },
      ...state,
    } satisfies TextProps;
  }

  return { useState, useRichText };
}
