import { literals } from '@blitzkit/i18n/src/literals';
import { EyeClosedIcon, EyeOpenIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Button, Checkbox, Flex, Text } from '@radix-ui/themes';
import { useLocale } from '../../../../../../hooks/useLocale';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../../stores/tankopediaPersistent';

export function Thicknesses() {
  const showModules = TankopediaPersistent.use((state) => state.showModules);
  const showArmorScreen = TankopediaPersistent.use(
    (state) => state.showArmorScreen,
  );
  const showArmor = TankopediaPersistent.use((state) => state.showArmor);
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const editStatic = TankopediaEphemeral.use((state) => state.editStatic);
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const { strings } = useLocale();
  const thicknessRange = TankopediaEphemeral.use(
    (state) => state.thicknessRange,
  );

  return (
    <Flex
      position="absolute"
      right="0"
      top="50%"
      mr="4"
      style={{ transform: 'translateY(-50%)', userSelect: 'none' }}
      direction="column"
      gap="5"
      align="end"
    >
      <Flex direction="column" align="end" gap="3">
        <Flex
          height="64px"
          gap="2"
          style={{ opacity: showArmor ? 1 : 0.5, cursor: 'pointer' }}
          onClick={() => {
            mutateTankopediaPersistent((draft) => {
              draft.showArmor = !draft.showArmor;
            });
            mutateTankopediaEphemeral((draft) => {
              draft.highlightArmor = undefined;
            });
          }}
        >
          <Flex direction="column" align="end" justify="between">
            <Text color="gray" size="1">
              {literals(strings.common.units.mm, [
                (thicknessRange * 1.5).toFixed(0),
              ])}
            </Text>
            <Text size="1">
              {strings.website.tools.tanks.sandbox.static.primary}
            </Text>
            <Text color="gray" size="1">
              {literals(strings.common.units.mm, ['0'])}
            </Text>
          </Flex>

          <Flex
            align="center"
            width="1rem"
            style={{
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              background: `linear-gradient(rgb(64, 0, 0), rgb(255, 0, 0) 33%, rgb(255, 255, 0) 66%, rgb(0, 255, 0))`,
              color: 'black',
            }}
          >
            {showArmor ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </Flex>
        </Flex>

        <Flex
          height="64px"
          gap="2"
          style={{ opacity: showArmorScreen ? 1 : 0.5, cursor: 'pointer' }}
          onClick={() => {
            mutateTankopediaPersistent((draft) => {
              draft.showArmorScreen = !draft.showArmorScreen;
            });
            mutateTankopediaEphemeral((draft) => {
              draft.highlightArmor = undefined;
            });
          }}
        >
          <Flex direction="column" align="end" justify="between">
            <Text color="gray" size="1">
              {literals(strings.common.units.mm, [thicknessRange.toFixed(0)])}
            </Text>
            <Text size="1">
              {strings.website.tools.tanks.sandbox.static.spaced}
            </Text>
            <Text color="gray" size="1">
              {literals(strings.common.units.mm, ['0'])}
            </Text>
          </Flex>

          <Flex
            align="center"
            width="1rem"
            style={{
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              background: `linear-gradient(rgb(32, 0, 225), rgb(255, 0, 255))`,
            }}
          >
            {showArmorScreen ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </Flex>
        </Flex>

        <Flex
          gap="2"
          style={{ opacity: showModules ? 1 : 0.5, cursor: 'pointer' }}
          onClick={() => {
            mutateTankopediaPersistent((draft) => {
              draft.showModules = !draft.showModules;
            });
            mutateTankopediaEphemeral((draft) => {
              draft.highlightArmor = undefined;
            });
          }}
        >
          <Flex direction="column" align="end" justify="between">
            <Text size="1">
              {strings.website.tools.tanks.sandbox.static.modules}
            </Text>
          </Flex>

          <Flex
            justify="center"
            width="1rem"
            height="1rem"
            style={{
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              backgroundColor: '#c0c0c0',
              color: 'black',
            }}
          >
            {showModules ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="column" align="end" gap="2">
        <Flex align="center" gap="2">
          <Flex
            gap="2"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              mutateTankopediaEphemeral((draft) => {
                draft.editStatic = !draft.editStatic;
                draft.highlightArmor = undefined;
              });
            }}
          >
            <Text size="1">
              {strings.website.tools.tanks.sandbox.static.edit.label}
            </Text>
            <Checkbox size="2" checked={editStatic} />
          </Flex>
        </Flex>

        <Button
          color="red"
          size="1"
          variant="ghost"
          onClick={() => {
            mutateTankopediaEphemeral((draft) => {
              draft.editStatic = false;
              draft.armor = tankopediaEphemeralStore.getInitialState().armor;
            });
          }}
        >
          <ReloadIcon />
          {strings.website.tools.tanks.sandbox.static.edit.reset}
        </Button>
      </Flex>

      {/* <Suspense>
        <DynamicArmorSwitcher />
      </Suspense> */}
    </Flex>
  );
}
