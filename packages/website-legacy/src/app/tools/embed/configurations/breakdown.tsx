import { compositeStatsKeys, tankDefinitionsArray } from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { use } from 'react';
import {
  BreakdownEmbedCard,
  BreakdownEmbedWrapper,
} from '../../../../components/TanksEmbed';
import { breakdownConfig } from '../../../../constants/embeds';
import { useEmbedStateCurry } from '../../../../stores/embedState/utilities';

export const compositeStatsKeysOptions = compositeStatsKeys.map((value) => ({
  label: strings.common.composite_stats[value],
  value,
}));

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
