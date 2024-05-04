import { CaretRightIcon } from '@radix-ui/react-icons';
import { Button, Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { useWideFormat } from '../../../../../../hooks/useWideFormat';
import strings from '../../../../../../lang/en-US.json';
import { theme } from '../../../../../../stitches.config';
import { useDuel } from '../../../../../../stores/duel';
import { TankSandbox } from './TankSandbox';
import { Options } from './components/Options';

export function HeroSection() {
  const protagonistTank = useDuel((state) => state.protagonist!.tank);
  const antagonistTank = useDuel((state) => state.antagonist!.tank);
  const wideFormat = useWideFormat(880);
  const compareTanks =
    protagonistTank.id === antagonistTank.id
      ? [protagonistTank.id]
      : [protagonistTank.id, antagonistTank.id];

  return (
    <Flex
      justify="center"
      pt={wideFormat ? '0' : '6'}
      style={{
        background: `linear-gradient(${wideFormat ? -90 : 180}deg, ${theme.colors.appBackground1}, ${theme.colors.appBackground2})`,
        position: 'relative',
        height: wideFormat ? undefined : 'calc(87.5vh - 64px)',
      }}
      gap="4"
    >
      <Flex
        direction={wideFormat ? 'row' : 'column'}
        style={{
          maxWidth: 1600,
          flex: 1,
        }}
      >
        <Flex
          align="center"
          justify="center"
          style={{
            flex: wideFormat ? 1 : undefined,
          }}
        >
          <Flex
            gap={wideFormat ? '4' : '2'}
            direction="column"
            ml={wideFormat ? '8' : undefined}
            align={wideFormat ? undefined : 'center'}
          >
            <Heading size={wideFormat ? '9' : '8'}>
              {protagonistTank.name}
            </Heading>
            <Text color="gray">
              Tier {TIER_ROMAN_NUMERALS[protagonistTank.tier]}{' '}
              {
                (strings.common.nations_adjectives as Record<string, string>)[
                  protagonistTank.nation
                ]
              }{' '}
              {strings.common.tank_class_short[protagonistTank.class]}
            </Text>

            <Link href={`/tools/compare?tanks=${compareTanks.join('%2C')}`}>
              <Button variant="ghost">
                Compare <CaretRightIcon />
              </Button>
            </Link>
          </Flex>
        </Flex>

        <div
          style={{
            height: wideFormat ? 512 : undefined,
            flex: 2,
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <TankSandbox />
            </div>

            <Options />
          </div>
        </div>
      </Flex>
    </Flex>
  );
}
