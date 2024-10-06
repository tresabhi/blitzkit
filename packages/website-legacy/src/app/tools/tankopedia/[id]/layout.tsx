import {
  fetchModelDefinitions,
  fetchTankDefinitions,
  tankIcon,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { ReactNode } from 'react';

export async function generateStaticParams() {
  const tankDefinitions = await fetchTankDefinitions();
  const tanks = Object.values(tankDefinitions.tanks);
  return tanks.map((tank) => ({ id: `${tank.id}` }));
}

const tankDefinitions = await fetchTankDefinitions();
const definitions = await fetchModelDefinitions();

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const id = Number(params.id);
  const tankModelDefinition = definitions[id];
  const awaitedProvisionDefinitions = await provisionDefinitions;
  const tank = tankDefinitions[id];
  const title = `${tank.name} - Tier ${TIER_ROMAN_NUMERALS[tank.tier]} ${
    (strings.common.nations_adjectives as Record<string, string>)[tank.nation]
  } ${strings.common.tank_class_short[tank.class]}`;
  const description = `Statistics, armor, and equipment for ${tank.name} in World of Tanks Blitz (WoTB)`;

  return (
    <TankopediaEphemeral.Provider data={tankModelDefinition}>
      <Duel.Provider
        data={{
          tank: tankDefinitions[id],
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
