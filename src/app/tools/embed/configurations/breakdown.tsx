import { grayA, grayDark, grayDarkA } from '@radix-ui/colors';
import { use } from 'react';
import {
  BreakdownEmbedCard,
  BreakdownEmbedWrapper,
} from '../../../../components/TanksEmbed';
import { tankDefinitionsArray } from '../../../../core/blitzkit/tankDefinitions';
import {
  CompositeStatsKey,
  compositeStatsKeys,
} from '../../../../core/statistics/compositeStats/constants';
import strings from '../../../../lang/en-US.json';
import { EmbedConfig } from '../../../../stores/embedState';
import { EmbedItemType } from '../../../../stores/embedState/constants';
import { useEmbedStateCurry } from '../../../../stores/embedState/utilities';

const compositeStatsKeysOptions = compositeStatsKeys.map((value) => ({
  label: strings.common.composite_stats[value],
  value,
}));

export const breakdownConfig = {
  showTotal: { type: EmbedItemType.Boolean, default: true, pad: true },

  listWidth: {
    type: EmbedItemType.Slider,
    default: 320,
    min: 128,
    max: 640,
  },
  listGap: { type: EmbedItemType.Size, default: '2' },
  listMaxTanks: {
    type: EmbedItemType.Slider,
    default: 4,
    min: 0,
    max: 8,
    pad: true,
  },

  cardRadius: { type: EmbedItemType.Radius, default: '2' },
  cardHeaderBackgroundColor: {
    type: EmbedItemType.Color,
    default: grayDarkA.grayA3,
  },
  cardHeaderPadding: { type: EmbedItemType.Size, default: '1' },
  cardTitle: {
    type: EmbedItemType.RichText,
    default: { color: grayDark.gray12, weight: 'bold', size: '3' },
  },
  cardTitleTypeColor: { type: EmbedItemType.Boolean, default: true },
  cardTitleClassIcon: { type: EmbedItemType.Boolean, default: true },
  cardBodyBackgroundColor: {
    type: EmbedItemType.Color,
    default: grayA.grayA11,
  },
  cardBodyPadding: {
    type: EmbedItemType.Size,
    default: '2',
    pad: true,
  },

  columnGap: { type: EmbedItemType.Size, default: '0' },
  columnValue: {
    type: EmbedItemType.RichText,
    default: { color: grayDark.gray12, size: '3', weight: 'regular' },
  },
  columnLabel: {
    type: EmbedItemType.RichText,
    default: { color: grayDark.gray11, size: '2', weight: 'regular' },
    pad: true,
  },

  column1: {
    type: EmbedItemType.Enum,
    default: 'cumulative_battles' satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column2: {
    type: EmbedItemType.Enum,
    default: 'normalized_wins' satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column3: {
    type: EmbedItemType.Enum,
    default: 'cumulative_wn8' satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column4: {
    type: EmbedItemType.Enum,
    default: 'normalized_damage_dealt' satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column1CustomLabel: { type: EmbedItemType.String, default: '' },
  column2CustomLabel: { type: EmbedItemType.String, default: '' },
  column3CustomLabel: { type: EmbedItemType.String, default: '' },
  column4CustomLabel: { type: EmbedItemType.String, default: '' },
} satisfies EmbedConfig;

export function BreakdownPreview() {
  const tanks = use(tankDefinitionsArray);
  const { useState } = useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <BreakdownEmbedWrapper>
      {useState('showTotal') && <BreakdownEmbedCard tank={null} />}

      {tanks.slice(0, useState('listMaxTanks')).map((tank) => (
        <BreakdownEmbedCard key={tank.id} tank={tank} />
      ))}
    </BreakdownEmbedWrapper>
  );
}
