import { Box } from '@radix-ui/themes';
import { useMemo } from 'react';
import { parse } from 'urlon';
import { BlitzKitTheme } from '../../../../../components/BlitzKitTheme';
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
import { useEmbedStateCurry } from '../../../../../stores/embedState/utilities';

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

  return (
    <EmbedState.Provider data={state}>
      <Content embed={embed} />
    </EmbedState.Provider>
  );
}

function Content({ embed }: PageProps) {
  const Renderer = embedRenderers[embed];
  const { useState } = useEmbedStateCurry();
  const width = useState('width');
  const height = useState('height');

  return (
    <BlitzKitTheme style={{ background: 'transparent' }}>
      <Box width={`${width}px`} height={`${height}px`} overflow="hidden">
        <Renderer />
      </Box>
    </BlitzKitTheme>
  );
}
