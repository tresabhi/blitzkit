import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { use } from 'react';
import PageWrapper from '../../../../../../components/PageWrapper';
import { asset } from '../../../../../../core/blitzkit/asset';
import { tankDefinitions } from '../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { useDuel } from '../../../../../../stores/duel';

function Arrow() {
  return (
    <Text
      color="gray"
      style={{
        flex: 1,
      }}
    >
      <Flex
        style={{
          backgroundColor: 'currentcolor',
          height: 1,
          position: 'relative',
        }}
        justify="end"
      >
        <ChevronRightIcon
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translate(5px, -50%)',
          }}
        />
      </Flex>
    </Text>
  );
}

export function TechTreeSection() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = useDuel((state) => state.protagonist!.tank);

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
        }}
      >
        <Flex direction="column" align="center">
          <img
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
                  src={asset('icons/currencies/xp.webp')}
                  width={16}
                  height={16}
                  style={{
                    objectFit: 'contain',
                  }}
                />
                <Text color="gray" size="1">
                  {tank.xp?.toLocaleString()}
                </Text>
              </Flex>

              <Flex gap="1" align="center">
                <img
                  src={asset('icons/currencies/silver.webp')}
                  width={16}
                  height={16}
                  style={{
                    objectFit: 'contain',
                  }}
                />
                <Text color="gray" size="1">
                  {tank.price.value?.toLocaleString()}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Link>
    );
  }

  return (
    <PageWrapper>
      <Heading>Tech tree</Heading>

      <Flex align="center" gap="6">
        {tank.ancestors && (
          <>
            <Flex
              wrap="wrap"
              direction="column"
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

            <Arrow />
          </>
        )}

        <Flex
          direction="column"
          style={{
            position: 'relative',
          }}
        >
          <Card id={tank.id} />

          <img
            src={asset(`flags/scratched/${tank.nation}.webp`)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              height: 180,
              transform: 'translate(-42%, -50%)',
              backgroundRepeat: 'no-repeat',
              zIndex: -1,
              opacity: 1 / 4,
              filter: 'blur(4px)',
            }}
          />
        </Flex>

        {tank.successors && (
          <>
            <Arrow />

            <Flex
              wrap="wrap"
              direction="column"
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
