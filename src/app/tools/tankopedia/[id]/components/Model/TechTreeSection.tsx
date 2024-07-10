import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Box, ChevronDownIcon, Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { ComponentProps, use } from 'react';
import PageWrapper from '../../../../../../components/PageWrapper';
import { asset } from '../../../../../../core/blitzkit/asset';
import { tankDefinitions } from '../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
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
                  {ancestor.xp?.toLocaleString()}
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
                  {ancestor.price.value?.toLocaleString()}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Link>
    );
  }

  return (
    <PageWrapper
      noFlex1
      containerProps={{
        style: {
          overflow: 'hidden',
          marginTop: 16,
          backgroundColor: 'var(--color-surface)',
        },
      }}
      size={tank.ancestors && tank.successors ? 880 : 480}
      gap="0"
    >
      <Flex justify="center" py="2" mb="4">
        <Heading>Tech tree</Heading>
      </Flex>

      {/* BIG TODO: use number format to shorten currencies */}

      <Flex
        align="center"
        gap="6"
        style={{}}
        direction={{ initial: 'column', sm: 'row' }}
      >
        {tank.ancestors && (
          <>
            <Flex
              wrap="wrap"
              direction={{ initial: 'column', sm: 'row' }}
              align="center"
              justify="center"
              style={{
                maxHeight: 360,
              }}
              gap="4"
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

        <Flex
          direction="column"
          style={{
            position: 'relative',
          }}
        >
          <img
            alt={tank.nation}
            src={asset(`flags/scratched/${tank.nation}.webp`)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              height: '200%',
              transform: 'translate(-40%, -50%)',
              backgroundRepeat: 'no-repeat',
              opacity: 1 / 4,
              filter: 'blur(4px)',
            }}
          />

          <Card id={tank.id} />
        </Flex>

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
              direction={{ initial: 'column', sm: 'row' }}
              align="center"
              justify="center"
              style={{
                maxHeight: 360,
              }}
              gap="4"
            >
              {tank.successors.map((id) => (
                <Card key={id} id={id} />
              ))}
            </Flex>
          </>
        )}
      </Flex>
    </PageWrapper>
  );
}
