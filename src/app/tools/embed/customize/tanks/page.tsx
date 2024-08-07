'use client';

import { use } from 'react';
import { EmbedCustomize } from '../../../../../components/EmbedCustomize';
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

const tankEmbedConfig = {
  showTotal: { type: EmbedConfigType.Boolean, default: true },

  listWidth: { type: EmbedConfigType.Slider, default: 320, min: 128, max: 640 },
  listGap: { type: EmbedConfigType.Size, default: '2' },
  listMaxTanks: { type: EmbedConfigType.Number, default: 4, pad: true },

  cardRadius: { type: EmbedConfigType.Radius, default: '2' },
  cardHeaderBackgroundColor: {
    type: EmbedConfigType.Color,
    default: { base: 'gray', variant: '3' },
  },
  cardHeaderPadding: { type: EmbedConfigType.Size, default: '1' },
  cardTitle: {
    type: EmbedConfigType.FullTextControl,
    default: { color: undefined, weight: 'bold', size: '3' },
  },
  cardTitleTypeColor: { type: EmbedConfigType.Boolean, default: true },
  cardTitleClassIcon: { type: EmbedConfigType.Boolean, default: true },
  cardBodyBackgroundColor: {
    type: EmbedConfigType.Color,
    default: { base: 'gray', variant: '2' },
  },
  cardBodyPadding: { type: EmbedConfigType.Size, default: '2', pad: true },

  columnGap: { type: EmbedConfigType.Size, default: '0' },
  columnValue: {
    type: EmbedConfigType.FullTextControl,
    default: { color: undefined, size: '3', weight: 'regular' },
  },
  columnLabel: {
    type: EmbedConfigType.FullTextControl,
    default: { color: 'gray', size: '2', weight: 'regular' },
    pad: true,
  },

  column1Unit: { type: EmbedConfigType.String, default: '' },
  column2Unit: { type: EmbedConfigType.String, default: '%' },
  column3Unit: { type: EmbedConfigType.String, default: '' },
  column4Unit: { type: EmbedConfigType.String, default: '' },
  column1Label: { type: EmbedConfigType.String, default: 'Battles' },
  column2Label: { type: EmbedConfigType.String, default: 'Winrate' },
  column3Label: { type: EmbedConfigType.String, default: 'WN8' },
  column4Label: { type: EmbedConfigType.String, default: 'Damage' },
} satisfies EmbedConfig;

export type TanksEmbedState = ExtractEmbedConfigType<typeof tankEmbedConfig>;

export default function Page() {
  const tanks = use(tanksDefinitionsArray);

  return (
    <EmbedCustomize
      config={tankEmbedConfig}
      preview={(state) => (
        <TanksEmbedWrapper state={state}>
          {state.showTotal && <TanksEmbedCard state={state} tank={null} />}

          {tanks.slice(0, state.listMaxTanks).map((tank) => (
            <TanksEmbedCard key={tank.id} tank={tank} state={state} />
          ))}
        </TanksEmbedWrapper>
      )}
    />
  );
}
