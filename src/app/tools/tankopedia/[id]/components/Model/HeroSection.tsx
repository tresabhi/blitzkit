import { EnterFullScreenIcon, ExitFullScreenIcon } from '@radix-ui/react-icons';
import { Checkbox, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { useFullScreen } from '../../../../../../hooks/useFullScreen';
import strings from '../../../../../../lang/en-US.json';
import { theme } from '../../../../../../stitches.config';
import { useDuel } from '../../../../../../stores/duel';
import mutateTankopediaPersistent, {
  useTankopediaPersistent,
} from '../../../../../../stores/tankopedia';
import { TankSandbox } from './TankSandbox';

export function HeroSection() {
  const tank = useDuel((state) => state.protagonist!.tank);
  const mode = useTankopediaPersistent((state) => state.mode);
  const isFullScreen = useFullScreen();

  return (
    <Flex
      justify="center"
      pl="9"
      style={{
        background: `linear-gradient(90deg, ${theme.colors.appBackground1}, ${theme.colors.appBackground2})`,
        position: 'relative',
      }}
    >
      <Flex
        style={{
          maxWidth: 1600,
          flex: 1,
        }}
      >
        <Flex
          direction="column"
          justify="center"
          style={{
            flex: 1,
          }}
        >
          <Heading size="7">{tank.name}</Heading>
          <Text color="gray">
            Tier {TIER_ROMAN_NUMERALS[tank.tier]}{' '}
            {(strings.common.nations as Record<string, string>)[tank.nation]}{' '}
            {strings.common.tank_class_short[tank.class]}
          </Text>
        </Flex>

        <div
          style={{
            height: 512,
            flex: 3,
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
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
            <Checkbox checked={mode === 'armor'} />
            Armor
          </Flex>
        </div>
      </Flex>

      <IconButton
        variant="ghost"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
        }}
        onClick={() => {
          document.body.requestFullscreen();
        }}
      >
        {isFullScreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
      </IconButton>
    </Flex>
  );
}
