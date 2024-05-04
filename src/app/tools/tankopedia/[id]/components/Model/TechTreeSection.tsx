import { ChevronRightIcon } from '@radix-ui/react-icons';
import { ChevronDownIcon, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { ComponentProps, use } from 'react';
import PageWrapper from '../../../../../../components/PageWrapper';
import { asset } from '../../../../../../core/blitzkit/asset';
import { tankDefinitions } from '../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { useWideFormat } from '../../../../../../hooks/useWideFormat';
import { useDuel } from '../../../../../../stores/duel';

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
  const wideFormat = useWideFormat(720);
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
        },
      }}
      size={tank.ancestors && tank.successors ? 880 : 480}
      gap="0"
      highlight
    >
      {/* <Flex justify="center">
        <Heading>Tech tree</Heading>
      </Flex> */}

      <Flex
        align="center"
        gap="6"
        style={{}}
        direction={wideFormat ? 'row' : 'column'}
      >
        {tank.ancestors && (
          <>
            <Flex
              wrap="wrap"
              direction={wideFormat ? 'column' : 'row'}
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

            <TreeArrow down={!wideFormat} />
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
            <TreeArrow down={!wideFormat} />

            <Flex
              wrap="wrap"
              direction={wideFormat ? 'column' : 'row'}
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
