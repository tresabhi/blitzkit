import { CaretRightIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import {
  ChevronDownIcon,
  Flex,
  Heading,
  ScrollArea,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { ComponentProps, use, useMemo } from 'react';
import { asset } from '../../../../../../core/blitzkit/asset';
import {
  TankDefinition,
  tankDefinitions,
} from '../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { formatCompact } from '../../../../../../core/math/formatCompact';
import * as Duel from '../../../../../../stores/duel';

export function TreeArrow({
  style,
  down = false,
  ...props
}: ComponentProps<typeof Text> & { down?: boolean }) {
  const Icon = down ? ChevronDownIcon : ChevronRightIcon;

  return (
    <Text
      color="gray"
      style={{
        flex: 1,
        ...style,
      }}
      {...props}
    >
      <Flex
        style={{
          backgroundColor: 'currentcolor',
          height: down ? '100%' : 1,
          width: down ? 1 : '100%',
          position: 'relative',
        }}
        direction={down ? 'column' : 'row'}
        justify="end"
      >
        <Icon
          style={{
            position: 'absolute',
            right: down ? undefined : 0,
            top: down ? undefined : '50%',
            bottom: down ? 0 : undefined,
            left: down ? '50%' : undefined,
            transform: down ? 'translate(-50%, 2px)' : 'translate(5px, -50%)',
          }}
        />
      </Flex>
    </Text>
  );
}

function Card({ id }: { id: number }) {
  const awaitedTankDefinitions = use(tankDefinitions);
  const ancestor = awaitedTankDefinitions[id];

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
      <Flex direction="column" align="center">
        <img
          alt={ancestor.name}
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
              {TIER_ROMAN_NUMERALS[ancestor.tier]}
            </Text>
            <Text wrap="nowrap">{ancestor.name}</Text>
          </Flex>

          <Flex gap="2" align="center">
            <Flex gap="1" align="center">
              <img
                alt="XP"
                src={asset('icons/currencies/xp.webp')}
                width={16}
                height={16}
                style={{
                  objectFit: 'contain',
                }}
              />
              <Text color="gray" size="1" wrap="nowrap">
                {ancestor.xp === undefined ? 0 : formatCompact(ancestor.xp!)}
              </Text>
            </Flex>

            <Flex gap="1" align="center">
              <img
                alt="Silver"
                src={asset('icons/currencies/silver.webp')}
                width={16}
                height={16}
                style={{
                  objectFit: 'contain',
                }}
              />
              <Text color="gray" size="1" wrap="nowrap">
                {formatCompact(ancestor.price.value)}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
}

export function TechTreeSection() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const awaitedTankDefinitions = use(tankDefinitions);

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
      if (ancestor.ancestors === undefined || ancestor.ancestors.length === 0) {
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

  console.log(ancestors);

  return (
    <Flex
      my="6"
      py="6"
      direction="column"
      align="center"
      gap="4"
      style={{
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <Heading size="6">Tech tree</Heading>

      <ScrollArea>
        <Flex align="center" gap="4" justify="center" p="4">
          {ancestors.map((id, index) => (
            <>
              {index > 0 && (
                <Text color="gray">
                  <CaretRightIcon />
                </Text>
              )}
              <Card key={id} id={id} />
            </>
          ))}
        </Flex>
      </ScrollArea>
    </Flex>
  );
}
