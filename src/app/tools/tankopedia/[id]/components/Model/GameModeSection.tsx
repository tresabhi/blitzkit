import { Box, Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { asset } from '../../../../../../core/blitzkit/asset';
import { gameDefinitions } from '../../../../../../core/blitzkit/gameDefinitions';
import * as Duel from '../../../../../../stores/duel';

export function GameModeSection() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const awaitedGameDefinitions = use(gameDefinitions);

  return (
    <Flex direction="column" gap="4" align="center">
      <Heading size="6">Game mode abilities</Heading>

      <Flex justify="center" gap="4" wrap="wrap">
        {Object.entries(tank.roles).map(([key, value]) => {
          const id = Number(key);
          const gameMode = awaitedGameDefinitions.gameModes[id];

          return (
            <Flex
              // width="256px"
              height="256px"
              overflow="hidden"
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
                style={{
                  backdropFilter: 'blur(4rem)',
                }}
              >
                <Heading size="4">{gameMode.name}</Heading>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
