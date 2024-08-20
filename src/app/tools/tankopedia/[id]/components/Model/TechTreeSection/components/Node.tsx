import { Box, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { use } from 'react';
import { asset } from '../../../../../../../../core/blitzkit/asset';
import { tankDefinitions } from '../../../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../../../core/blitzkit/tankDefinitions/constants';
import { formatCompact } from '../../../../../../../../core/math/formatCompact';

export function Node({ id, highlight }: { id: number; highlight?: boolean }) {
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = awaitedTankDefinitions[id];

  return (
    <Link
      href={`/tools/tankopedia/${id}`}
      key={id}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
      }}
    >
      <Box
        mx={highlight ? '2' : '0'}
        style={{
          background: highlight
            ? `url(${asset(`flags/fade_small/${tank.nation}.webp`)})`
            : undefined,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          boxShadow: highlight ? 'var(--shadow-4)' : undefined,
          borderRadius: 'var(--radius-4)',
          overflow: 'hidden',
        }}
      >
        <Flex
          direction="column"
          align="center"
          py="4"
          px={highlight ? '4' : '2'}
          style={{
            backdropFilter: highlight ? 'brightness(0.25)' : undefined,
            WebkitBackdropFilter: highlight ? 'brightness(0.25)' : undefined,
          }}
        >
          <img
            alt={tank.name}
            src={asset(`icons/tanks/big/${id}.webp`)}
            width={64}
            height={64}
            style={{
              objectFit: 'contain',
            }}
          />

          <Flex direction="column" align="center">
            <Flex gap="2" align="center">
              <Text color="gray" size="1">
                {TIER_ROMAN_NUMERALS[tank.tier]}
              </Text>
              <Text wrap="nowrap">{tank.name}</Text>
            </Flex>

            <Flex gap="2" align="center">
              <Text color="gray" size="1" wrap="nowrap">
                <Flex gap="1" align="center">
                  <img
                    alt="XP"
                    src={asset('icons/currencies/xp.webp')}
                    style={{
                      width: '1em',
                      height: '1em',
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                  />
                  {tank.xp === undefined || tank.tier === 1
                    ? 0
                    : formatCompact(tank.xp!)}
                </Flex>
              </Text>

              <Text color="gray" size="1" wrap="nowrap">
                <Flex gap="1" align="center">
                  <img
                    alt="Silver"
                    src={asset('icons/currencies/silver.webp')}
                    style={{
                      width: '1em',
                      height: '1em',
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                  />
                  {formatCompact(tank.price.value)}
                </Flex>
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Link>
  );
}
