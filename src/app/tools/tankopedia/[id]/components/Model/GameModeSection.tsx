import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { use } from 'react';
import { asset } from '../../../../../../core/blitzkit/asset';
import { consumableDefinitions } from '../../../../../../core/blitzkit/consumableDefinitions';
import { gameDefinitions } from '../../../../../../core/blitzkit/gameDefinitions';
import { provisionDefinitions } from '../../../../../../core/blitzkit/provisionDefinitions';
import * as Duel from '../../../../../../stores/duel';

export function GameModeSection() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const awaitedGameDefinitions = use(gameDefinitions);
  const awaitedConsumableDefinitions = use(consumableDefinitions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);

  return (
    <Flex direction="column" gap="4" align="center">
      <Heading size="6">Game mode abilities</Heading>

      <Flex justify="center" gap="4" wrap="wrap" px="4">
        {Object.entries(tank.roles).map(([key, value]) => {
          const id = Number(key);
          const gameMode = awaitedGameDefinitions.gameModes[id];

          return (
            <Flex
              width="256px"
              height="256px"
              overflow="hidden"
              direction="column"
              style={{
                borderRadius: 'var(--radius-3)',
                background: `url(${asset(`icons/game_mode_banners/${id}.webp`)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Box
                style={{
                  aspectRatio: '1 / 2',
                  background: `url(${asset(`icons/game_mode_banners/${id}.webp`)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              <Flex
                flexGrow="1"
                p="3"
                direction="column"
                style={{
                  backdropFilter: 'blur(4rem)',
                  WebkitBackdropFilter: 'blur(4rem)',
                }}
                align="center"
                justify="center"
              >
                <Text size="4" weight="bold">
                  {gameMode.name}
                </Text>

                <Flex direction="column">
                  {awaitedGameDefinitions.roles[value].provisions.map((id) => {
                    const provisions = awaitedProvisionDefinitions[id];

                    return (
                      <Text color="gray" wrap="nowrap">
                        <Flex align="center" gap="1">
                          <img
                            style={{
                              width: '1.5em',
                              height: '1.5em',
                              objectFit: 'contain',
                            }}
                            src={asset(`icons/provisions/${id}.webp`)}
                            alt={provisions.name}
                          />
                          {provisions.name}
                        </Flex>
                      </Text>
                    );
                  })}
                  {awaitedGameDefinitions.roles[value].consumables.map((id) => {
                    const consumable = awaitedConsumableDefinitions[id];

                    return (
                      <Text color="gray" wrap="nowrap">
                        <Flex align="center" gap="1">
                          <img
                            style={{
                              width: '1.5em',
                              height: '1.5em',
                              objectFit: 'contain',
                            }}
                            src={asset(`icons/consumables/${id}.webp`)}
                            alt={consumable.name}
                          />
                          {consumable.name}
                        </Flex>
                      </Text>
                    );
                  })}
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
