import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Box, ChevronDownIcon, Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { ComponentProps, use } from 'react';
import { asset } from '../../../../../../core/blitzkit/asset';
import { tankDefinitions } from '../../../../../../core/blitzkit/tankDefinitions';
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

export function TechTreeSection() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = Duel.use((state) => state.protagonist.tank);

  if (tank.treeType !== 'researchable') return null;

  function Card({ id }: { id: number }) {
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
              <Text>{ancestor.name}</Text>
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
                <Text color="gray" size="1">
                  {formatCompact(ancestor.xp!)}
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
                <Text color="gray" size="1">
                  {formatCompact(ancestor.price.value)}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Link>
    );
  }

  return (
    <Flex
      my="6"
      p="5"
      style={{
        overflow: 'hidden',
        backgroundColor: 'var(--color-surface)',
      }}
      align="center"
      direction="column"
      position="relative"
    >
      <img
        src={asset(`flags/scratched/${tank.nation}.webp`)}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-40%, -50%)',
          filter: 'blur(2px)',
          opacity: 0.25,
        }}
      />

      <Heading mb="4">Tech tree</Heading>

      <Flex align="center" gap="6" direction={{ initial: 'column', sm: 'row' }}>
        {tank.ancestors && (
          <>
            <Flex
              wrap="wrap"
              direction={{ initial: 'row', sm: 'column' }}
              maxHeight={{ initial: 'unset', sm: '320px' }}
              align="center"
              justify="center"
              gap="6"
            >
              {tank.ancestors.map((id) => (
                <Card key={id} id={id} />
              ))}
            </Flex>

            <Box display={{ initial: 'block', sm: 'none' }}>
              <TreeArrow down />
            </Box>
            <Box display={{ initial: 'none', sm: 'block' }}>
              <TreeArrow />
            </Box>
          </>
        )}

        <Card id={tank.id} />

        {tank.successors && (
          <>
            <Box display={{ initial: 'block', sm: 'none' }}>
              <TreeArrow down />
            </Box>
            <Box display={{ initial: 'none', sm: 'block' }}>
              <TreeArrow />
            </Box>

            <Flex
              wrap="wrap"
              direction={{ initial: 'row', sm: 'column' }}
              maxHeight={{ initial: 'unset', sm: '320px' }}
              align="center"
              justify="center"
              gap="6"
            >
              {tank.successors.map((id) => (
                <Card key={id} id={id} />
              ))}
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
}
