import { EyeClosedIcon, EyeOpenIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Checkbox, Flex, Text } from '@radix-ui/themes';
import { Suspense } from 'react';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../../stores/tankopediaPersistent';
import type { ThicknessRange } from '../../../../../Armor/components/StaticArmor';
import { DynamicArmorSwitcher } from './DynamicArmorSwitcher';

interface ThicknessesProps {
  thicknessRange: ThicknessRange;
}

export function Thicknesses({ thicknessRange }: ThicknessesProps) {
  const showExternalModules = TankopediaPersistent.use(
    (state) => state.showExternalModules,
  );
  const showSpacedArmor = TankopediaPersistent.use(
    (state) => state.showSpacedArmor,
  );
  const showPrimaryArmor = TankopediaPersistent.use(
    (state) => state.showPrimaryArmor,
  );
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const editStatic = TankopediaEphemeral.use((state) => state.editStatic);
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();

  return (
    <Flex
      position="absolute"
      right="0"
      top="50%"
      mr="4"
      style={{ transform: 'translateY(-50%)', userSelect: 'none' }}
      direction="column"
      gap="2"
      align="end"
    >
      <Flex
        height="64px"
        gap="2"
        style={{ opacity: showPrimaryArmor ? 1 : 0.5, cursor: 'pointer' }}
        onClick={() => {
          mutateTankopediaPersistent((draft) => {
            draft.showPrimaryArmor = !draft.showPrimaryArmor;
          });
          mutateTankopediaEphemeral((draft) => {
            draft.highlightArmor = undefined;
          });
        }}
      >
        <Flex direction="column" align="end" justify="between">
          <Text color="gray" size="1">
            {(thicknessRange.value * 1.5).toFixed(0)}
          </Text>
          <Flex gap="1">
            {showPrimaryArmor ? <EyeOpenIcon /> : <EyeClosedIcon />}
            <Text size="1">Primary</Text>
          </Flex>
          <Text color="gray" size="1">
            0
          </Text>
        </Flex>

        <Box
          width="16px"
          style={{
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            background: `linear-gradient(rgb(64, 0, 0), rgb(255, 0, 0) 33%, rgb(255, 255, 0) 66%, rgb(0, 255, 0))`,
          }}
        />
      </Flex>

      <Flex
        height="64px"
        gap="2"
        style={{ opacity: showSpacedArmor ? 1 : 0.5, cursor: 'pointer' }}
        onClick={() => {
          mutateTankopediaPersistent((draft) => {
            draft.showSpacedArmor = !draft.showSpacedArmor;
          });
          mutateTankopediaEphemeral((draft) => {
            draft.highlightArmor = undefined;
          });
        }}
      >
        <Flex direction="column" align="end" justify="between">
          <Text color="gray" size="1">
            {thicknessRange.value.toFixed(0)}
          </Text>
          <Flex gap="1">
            {showSpacedArmor ? <EyeOpenIcon /> : <EyeClosedIcon />}
            <Text size="1">Spaced</Text>
          </Flex>
          <Text color="gray" size="1">
            0
          </Text>
        </Flex>

        <Box
          width="16px"
          style={{
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            background: `linear-gradient(rgb(32, 0, 225), rgb(255, 0, 255))`,
          }}
        />
      </Flex>

      <Flex
        gap="2"
        style={{ opacity: showExternalModules ? 1 : 0.5, cursor: 'pointer' }}
        onClick={() => {
          mutateTankopediaPersistent((draft) => {
            draft.showExternalModules = !draft.showExternalModules;
          });
          mutateTankopediaEphemeral((draft) => {
            draft.highlightArmor = undefined;
          });
        }}
      >
        <Flex direction="column" align="end" justify="between">
          <Flex gap="1">
            {showExternalModules ? <EyeOpenIcon /> : <EyeClosedIcon />}
            <Text size="1">External</Text>
          </Flex>
        </Flex>

        <Box
          width="16px"
          height="16px"
          style={{
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            backgroundColor: '#c0c0c0',
          }}
        />
      </Flex>

      <Flex align="center" gap="2" mt="2">
        <Button
          color="red"
          size="1"
          variant="ghost"
          onClick={() => {
            mutateTankopediaEphemeral((draft) => {
              draft.editStatic = false;
              draft.model = tankopediaEphemeralStore.getInitialState().model;
            });
          }}
        >
          <ReloadIcon />
          Reset
        </Button>

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
          <Text size="1">Edit</Text>
          <Checkbox size="2" checked={editStatic} />
        </Flex>
      </Flex>

      <Suspense>
        <DynamicArmorSwitcher />
      </Suspense>
    </Flex>
  );
}
