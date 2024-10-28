import { useMemo } from 'react';
import { parse } from 'urlon';
import {
  embedConfigurations,
  embedRenderers,
  extractEmbedConfigDefaults,
} from '../../../../../constants/embeds';
import {
  EmbedState,
  type EmbedConfig,
  type ExtractEmbedConfigTypes,
} from '../../../../../stores/embedState';

interface PageProps {
  embed: keyof typeof embedConfigurations;
}

export function Page({ embed }: PageProps) {
  const state = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const stateRaw = params.get('state');
    const partialState = stateRaw === null ? {} : parse(stateRaw);
    const state = {
      ...extractEmbedConfigDefaults(embedConfigurations[embed]),
      ...partialState,
    } as ExtractEmbedConfigTypes<EmbedConfig>;

    return state;
  }, [embed]);
  const Renderer = embedRenderers[embed];

  return (
    <EmbedState.Provider data={state}>
      <Renderer />
    </EmbedState.Provider>
  );
}
