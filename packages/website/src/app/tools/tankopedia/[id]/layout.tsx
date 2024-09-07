import {
  modelDefinitions,
  provisionDefinitions,
  tankDefinitions,
  tankIcon,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { ReactNode } from 'react';
import * as Duel from '../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../stores/tankopediaEphemeral';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const id = Number(params.id);
  const awaitedTankDefinitions = await tankDefinitions;
  const awaitedModelDefinitions = await modelDefinitions;
  const tankModelDefinition = awaitedModelDefinitions[id];
  const awaitedProvisionDefinitions = await provisionDefinitions;
  const tank = awaitedTankDefinitions[id];
  const title = `${tank.name} - Tier ${TIER_ROMAN_NUMERALS[tank.tier]} ${
    (strings.common.nations_adjectives as Record<string, string>)[tank.nation]
  } ${strings.common.tank_class_short[tank.class]}`;
  const description = `Statistics, armor, and equipment for ${tank.name} in World of Tanks Blitz (WoTB)`;

  return (
    <TankopediaEphemeral.Provider data={tankModelDefinition}>
      <Duel.Provider
        data={{
          tank: awaitedTankDefinitions[id],
          provisionDefinitions: awaitedProvisionDefinitions,
        }}
      >
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:image" content={tankIcon(id)} />
        <meta property="og:description" content={description} />

        {children}
      </Duel.Provider>
    </TankopediaEphemeral.Provider>
  );
}
