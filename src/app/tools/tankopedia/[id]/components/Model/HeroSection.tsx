import { Flex, Heading, Text } from '@radix-ui/themes';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { useWideFormat } from '../../../../../../hooks/useWideFormat';
import strings from '../../../../../../lang/en-US.json';
import { theme } from '../../../../../../stitches.config';
import { useDuel } from '../../../../../../stores/duel';
import { TankSandbox } from './TankSandbox';
import { Options } from './components/Options';

export function HeroSection() {
  const tank = useDuel((state) => state.protagonist!.tank);
  const wideFormat = useWideFormat(880);

  return (
    <Flex
      justify="center"
      py={wideFormat ? '0' : '6'}
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
            <Heading size={wideFormat ? '9' : '8'}>{tank.name}</Heading>
            <Text color="gray">
              Tier {TIER_ROMAN_NUMERALS[tank.tier]}{' '}
              {
                (strings.common.nations_adjectives as Record<string, string>)[
                  tank.nation
                ]
              }{' '}
              {strings.common.tank_class_short[tank.class]}
            </Text>
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
