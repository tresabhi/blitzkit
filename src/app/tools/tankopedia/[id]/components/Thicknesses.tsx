import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import { ThicknessRange } from '../../../../../components/StaticArmor/components/StaticArmorScene';
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
  const showCoreArmor = TankopediaPersistent.use(
    (state) => state.model.visual.showCoreArmor,
  );
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();

  return (
    <Flex
      position="absolute"
      right="0"
      top="50%"
      mr="4"
      style={{ transform: 'translateY(-50%)' }}
      direction="column"
      gap="2"
      align="end"
    >
      <Flex
        height="64px"
        gap="2"
        style={{ opacity: showCoreArmor ? 1 : 0.5, cursor: 'pointer' }}
        onClick={() => {
          mutateTankopediaPersistent((draft) => {
            draft.model.visual.showCoreArmor =
              !draft.model.visual.showCoreArmor;
          });
        }}
      >
        <Flex direction="column" align="end" justify="between">
          <Text color="gray" size="1">
            {thicknessRange.quartile.toFixed(0)}
          </Text>
          <Flex gap="1">
            {showCoreArmor ? <EyeOpenIcon /> : <EyeClosedIcon />}
            <Text size="1">Core</Text>
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
            background: `linear-gradient(rgb(255, 0, 0), rgb(0, 255, 0))`,
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
        }}
      >
        <Flex direction="column" align="end" justify="between">
          <Text color="gray" size="1">
            {thicknessRange.quartile.toFixed(0)}
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
            background: `linear-gradient(rgb(32, 0, 223), rgb(255, 0, 255))`,
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
            backgroundColor: 'rgb(0, 64, 128)',
          }}
        />
      </Flex>
    </Flex>
  );
}
