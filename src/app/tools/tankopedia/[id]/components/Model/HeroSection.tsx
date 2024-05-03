import { Flex, Heading, Switch, Text } from '@radix-ui/themes';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { useWideFormat } from '../../../../../../hooks/useWideFormat';
import strings from '../../../../../../lang/en-US.json';
import { theme } from '../../../../../../stitches.config';
import { useDuel } from '../../../../../../stores/duel';
import mutateTankopediaPersistent, {
  useTankopediaPersistent,
} from '../../../../../../stores/tankopedia';
import { TankSandbox } from './TankSandbox';
import { Options } from './components/Options';

export function HeroSection() {
  const tank = useDuel((state) => state.protagonist!.tank);
  const mode = useTankopediaPersistent((state) => state.mode);
  const wideFormat = useWideFormat(880);

  return (
    <Flex
      justify="center"
      // pl={wideFormat ? '9' : undefined}
      p={wideFormat ? '0' : '6'}
      pb={wideFormat ? '0' : '6'}
      style={{
        background: `linear-gradient(-90deg, ${theme.colors.appBackground1}, ${theme.colors.appBackground2})`,
        position: 'relative',
      }}
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
            flex: 1,
          }}
        >
          <Flex gap={wideFormat ? '4' : '2'} direction="column">
            <Heading size={wideFormat ? '9' : '8'}>{tank.name}</Heading>
            <Text color="gray">
              Tier {TIER_ROMAN_NUMERALS[tank.tier]}{' '}
              {(strings.common.nations as Record<string, string>)[tank.nation]}{' '}
              {strings.common.tank_class_short[tank.class]}
            </Text>
          </Flex>
        </Flex>

        <div
          style={{
            height: 512,
            flex: wideFormat ? 2 : undefined,
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

            <Flex
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                cursor: 'default',
                userSelect: 'none',
              }}
              align="center"
              gap="2"
              onClick={() => {
                mutateTankopediaPersistent((draft) => {
                  draft.mode = draft.mode === 'armor' ? 'model' : 'armor';
                });
              }}
            >
              <Switch checked={mode === 'armor'} />
              Armor
            </Flex>
          </div>
        </div>
      </Flex>

      <Options />
    </Flex>
  );
}
