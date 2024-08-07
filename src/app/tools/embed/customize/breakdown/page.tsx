'use client';

import { use } from 'react';
import { EmbedCustomize } from '../../../../../components/EmbedCustomize';
import {
  BreakdownEmbedCard,
  BreakdownEmbedWrapper,
} from '../../../../../components/TanksEmbed';
import { tanksDefinitionsArray } from '../../../../../core/blitzkit/tankDefinitions';
import {
  EmbedConfig,
  EmbedConfigType,
  ExtractEmbedConfigType,
} from '../../types';

const breakdownEmbedConfig = {
  showTotal: { type: EmbedConfigType.Boolean, default: true },

  listWidth: { type: EmbedConfigType.Slider, default: 320, min: 128, max: 640 },
  listGap: { type: EmbedConfigType.Size, default: '2' },
  listMaxTanks: {
    type: EmbedConfigType.Slider,
    default: 4,
    min: 0,
    max: 8,
    pad: true,
  },

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

export type BreakdownEmbedState = ExtractEmbedConfigType<
  typeof breakdownEmbedConfig
>;

export default function Page() {
  const tanks = use(tanksDefinitionsArray);

  return (
    <EmbedCustomize
      config={breakdownEmbedConfig}
      preview={(state) => (
        <BreakdownEmbedWrapper state={state}>
          {state.showTotal && <BreakdownEmbedCard state={state} tank={null} />}

          {tanks.slice(0, state.listMaxTanks).map((tank) => (
            <BreakdownEmbedCard key={tank.id} tank={tank} state={state} />
          ))}
        </BreakdownEmbedWrapper>
      )}
    />
  );
}
