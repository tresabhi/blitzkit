import { CaretRightIcon, PlusIcon } from '@radix-ui/react-icons';
import { Box, Flex, Heading, ScrollArea, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { use, useEffect, useMemo, useRef } from 'react';
import { asset } from '../../../../../../core/blitzkit/asset';
import {
  TankDefinition,
  tankDefinitions,
} from '../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { formatCompact } from '../../../../../../core/math/formatCompact';
import * as Duel from '../../../../../../stores/duel';

function Card({ id, highlight }: { id: number; highlight?: boolean }) {
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

function Arrow() {
  return (
    <Text color="gray">
      <CaretRightIcon />
    </Text>
  );
}

export function TechTreeSection() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const awaitedTankDefinitions = use(tankDefinitions);
  const container = useRef<HTMLDivElement>(null);

  if (
    tank.treeType !== 'researchable' ||
    tank.ancestors === undefined ||
    tank.ancestors.length === 0
  ) {
    return null;
  }

  const ancestors = useMemo(() => {
    const treeBackwards: number[] = [];
    let ancestor: TankDefinition | undefined = tank;

    while (ancestor !== undefined) {
      if (
        ancestor.tier === 1 ||
        ancestor.ancestors === undefined ||
        ancestor.ancestors.length === 0
      ) {
        ancestor = undefined;
        break;
      } else if (ancestor.ancestors.length === 1) {
        ancestor = awaitedTankDefinitions[ancestor.ancestors[0]];
      } else {
        let bestAncestor = awaitedTankDefinitions[ancestor.ancestors[0]];

        ancestor.ancestors.forEach((thisAncestorId) => {
          const possibleAncestor = awaitedTankDefinitions[thisAncestorId];

          if (possibleAncestor.xp! < bestAncestor.xp!) {
            bestAncestor = possibleAncestor;
          }
        });

        ancestor = bestAncestor as TankDefinition;
      }

      treeBackwards.push(ancestor.id);
    }

    return treeBackwards.reverse();
  }, []);

  useEffect(() => {
    if (!container.current) return;

    container.current.scrollLeft = container.current.scrollWidth;
  });

  return (
    <Flex
      my="6"
      direction="column"
      align="center"
      gap="4"
      style={{
        backgroundColor: 'var(--color-surface)',
      }}
      py="4"
    >
      <Heading size="6" style={{ position: 'absolute' }} mt="3">
        Tech tree
      </Heading>

      <ScrollArea type="hover" scrollbars="horizontal" ref={container}>
        <Flex align="center" gap="2" justify="center" p="6" pt="9">
          {ancestors.map((id, index) => (
            <>
              {index > 0 && <Arrow />}
              <Card key={id} id={id} />
            </>
          ))}

          <Arrow />
          <Card highlight id={tank.id} />

          {tank.tier < 10 && (
            <>
              <Arrow />
              {tank.successors!.map((id, index) => (
                <>
                  {index > 0 && (
                    <Text color="gray">
                      <PlusIcon />
                    </Text>
                  )}
                  <Card key={id} id={id} />
                </>
              ))}
            </>
          )}
        </Flex>
      </ScrollArea>
    </Flex>
  );
}
