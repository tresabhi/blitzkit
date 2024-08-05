'use client';

import { Flex } from '@radix-ui/themes';
import { Dispatch, SetStateAction, use, useState } from 'react';
import { EmbedConfigInputs } from '../../../../../components/EmbedConfigInputs';
import PageWrapper from '../../../../../components/PageWrapper';
import {
  TanksEmbedCard,
  TanksEmbedWrapper,
} from '../../../../../components/TanksEmbed';
import { tanksDefinitionsArray } from '../../../../../core/blitzkit/tankDefinitions';
import {
  EmbedConfig,
  EmbedConfigType,
  ExtractEmbedConfigType,
} from '../../types';
import { extractEmbedConfigDefaults } from '../../utilities';

const tankEmbedConfig = {
  listWidth: { type: EmbedConfigType.Number, default: 320, unit: 'px' },
  listGap: { type: EmbedConfigType.Size, default: '2' },
  listMaxTanks: { type: EmbedConfigType.Number, default: 8 },

  cardRadius: { type: EmbedConfigType.Radius, default: '2' },
  cardHeaderPadding: { type: EmbedConfigType.Size, default: '2' },
} satisfies EmbedConfig;

export type TanksEmbedState = ExtractEmbedConfigType<typeof tankEmbedConfig>;

export default function Page() {
  const tanks = use(tanksDefinitionsArray);
  const [state, setState] = useState(
    extractEmbedConfigDefaults(tankEmbedConfig),
  );

  return (
    <PageWrapper>
      <Flex align="start" justify="between" gap="4">
        <TanksEmbedWrapper state={state}>
          {tanks.slice(0, state.listMaxTanks).map((tank) => (
            <TanksEmbedCard key={tank.id} tank={tank} state={state} />
          ))}
        </TanksEmbedWrapper>

        <EmbedConfigInputs
          config={tankEmbedConfig}
          state={state}
          setState={
            setState as Dispatch<
              SetStateAction<ExtractEmbedConfigType<EmbedConfig>>
            >
          }
        />
      </Flex>
    </PageWrapper>
  );
}
