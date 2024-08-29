import { EyeClosedIcon, EyeOpenIcon, ReloadIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  IconButton,
  Text,
} from '@radix-ui/themes';
import { invalidate } from '@react-three/fiber';
import { use } from 'react';
import { ThicknessRange } from '../../../../../components/Armor/components/StaticArmor';
import { asset } from '../../../../../core/blitzkit/asset';
import { checkConsumableProvisionInclusivity } from '../../../../../core/blitzkit/checkConsumableProvisionInclusivity';
import { consumableDefinitions } from '../../../../../core/blitzkit/consumableDefinitions';
import * as Duel from '../../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../../stores/tankopediaEphemeral';
import * as TankopediaPersistent from '../../../../../stores/tankopediaPersistent';

interface ThicknessesProps {
  thicknessRange: ThicknessRange;
}

export function Thicknesses({ thicknessRange }: ThicknessesProps) {
  const showExternalModules = TankopediaPersistent.use(
    (state) => state.model.visual.showExternalModules,
  );
  const showSpacedArmor = TankopediaPersistent.use(
    (state) => state.model.visual.showSpacedArmor,
  );
  const showPrimaryArmor = TankopediaPersistent.use(
    (state) => state.model.visual.showPrimaryArmor,
  );
  const mutateDuel = Duel.useMutation();
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const editStatic = TankopediaEphemeral.use((state) => state.editStatic);
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  const protagonistGun = Duel.use((state) => state.protagonist.gun);
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const awaitedConsumableDefinitions = use(consumableDefinitions);
  const protagonistConsumables = Duel.use(
    (state) => state.protagonist.consumables,
  );
  const hasDynamicArmor = protagonistConsumables.includes(73);
  const consumablesList = Object.values(awaitedConsumableDefinitions).filter(
    (consumable) =>
      checkConsumableProvisionInclusivity(
        consumable,
        protagonistTank,
        protagonistGun,
      ),
  );

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
            draft.model.visual.showPrimaryArmor =
              !draft.model.visual.showPrimaryArmor;
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
            draft.model.visual.showSpacedArmor =
              !draft.model.visual.showSpacedArmor;
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
            draft.model.visual.showExternalModules =
              !draft.model.visual.showExternalModules;
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
            backgroundColor: '#3eb0c6',
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

      {consumablesList.some((consumable) => consumable.id === 73) && (
        <IconButton
          color={hasDynamicArmor ? undefined : 'gray'}
          variant="soft"
          size={{ initial: '2', sm: '3' }}
          onClick={() => {
            invalidate();
            mutateDuel((draft) => {
              if (draft.protagonist.consumables.includes(73)) {
                draft.protagonist.consumables =
                  draft.protagonist.consumables.filter((id) => id !== 73);
              } else {
                if (
                  draft.protagonist.consumables.length ===
                  protagonistTank.consumables
                ) {
                  draft.protagonist.consumables[
                    protagonistTank.consumables - 1
                  ] = 73;
                } else {
                  draft.protagonist.consumables.push(73);
                }
              }
            });
            mutateTankopediaEphemeral((draft) => {
              draft.shot = undefined;
            });
          }}
        >
          <img
            alt="Calibrated Shells"
            src={asset('icons/consumables/73.webp')}
            style={{
              width: '50%',
              height: '50%',
            }}
          />
        </IconButton>
      )}
    </Flex>
  );
}
