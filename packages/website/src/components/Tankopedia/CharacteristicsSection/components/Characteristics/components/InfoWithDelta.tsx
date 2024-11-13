import {
  createDefaultSkills,
  fetchEquipmentDefinitions,
  fetchModelDefinitions,
  fetchProvisionDefinitions,
  fetchSkillDefinitions,
  fetchTankDefinitions,
} from '@blitzkit/core';
import { Flex, Progress, Text } from '@radix-ui/themes';
import { useMemo, type ComponentProps } from 'react';
import {
  tankCharacteristics,
  type TankCharacteristics,
} from '../../../../../../core/blitzkit/tankCharacteristics';
import { tankToDuelMember } from '../../../../../../core/blitzkit/tankToDuelMember';
import { useDelta } from '../../../../../../hooks/useDelta';
import { Duel } from '../../../../../../stores/duel';
import { Info, type InfoProps } from './Info';

interface InfoWithDeltaProps extends InfoProps {
  stats: TankCharacteristics;
  value:
    | keyof TankCharacteristics
    | ((tank: TankCharacteristics) => number | undefined);
  noRanking?: boolean;
}

const tankDefinitions = await fetchTankDefinitions();
const provisionDefinitions = await fetchProvisionDefinitions();
const equipmentDefinitions = await fetchEquipmentDefinitions();
const tankModelDefinitions = await fetchModelDefinitions();
const skillDefinitions = await fetchSkillDefinitions();

export function InfoWithDelta({
  value,
  stats,
  indent,
  noRanking,
  deltaType,
  ...props
}: InfoWithDeltaProps) {
  const uhWhatDoICallThisVariable =
    typeof value === 'function' ? value(stats)! : (stats[value] as number);
  const delta = useDelta(uhWhatDoICallThisVariable);
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  const others = useMemo(() => {
    const defaultSkills = createDefaultSkills(skillDefinitions);

    return Object.values(tankDefinitions.tanks)
      .filter((tank) => tank.tier === protagonistTank.tier)
      .map((tank) => {
        const member = tankToDuelMember(tank, provisionDefinitions);

        return tankCharacteristics(
          {
            applyDynamicArmor: false,
            applyReactiveArmor: false,
            applySpallLiner: false,
            camouflage: member.camouflage,
            consumables: member.consumables,
            crewSkills: defaultSkills,
            provisions: member.provisions,
            engine: member.engine,
            gun: member.gun,
            equipmentMatrix: member.equipmentMatrix,
            shell: member.shell,
            stockEngine: tank.engines[0],
            stockGun: tank.turrets[0].guns[0],
            stockTrack: tank.tracks[0],
            stockTurret: tank.turrets[0],
            tank,
            track: member.track,
            turret: member.turret,
          },
          {
            equipmentDefinitions,
            provisionDefinitions,
            tankModelDefinition: tankModelDefinitions.models[tank.id],
          },
        );
      })
      .filter((tank) => {
        const othersValue =
          typeof value === 'function' ? value(tank)! : (tank[value] as number);

        return othersValue !== undefined;
      });
  }, []);
  const betterTanks = others.filter((tank) => {
    const othersValue =
      typeof value === 'function' ? value(tank)! : (tank[value] as number);

    if (othersValue === undefined) return false;
    return deltaType === 'lowerIsBetter'
      ? othersValue < uhWhatDoICallThisVariable
      : othersValue > uhWhatDoICallThisVariable;
  });
  const goodness = (others.length - betterTanks.length) / others.length;
  let color: ComponentProps<typeof Progress>['color'];

  if (goodness <= 0.25) color = 'red';
  else if (goodness <= 0.5) color = 'orange';
  else if (goodness <= 0.75) color = 'yellow';
  else color = 'green';

  return (
    <Flex direction="column">
      <Info deltaType={deltaType} indent={indent} {...props} delta={delta}>
        {uhWhatDoICallThisVariable}
      </Info>

      {!noRanking && (
        <Flex pl={indent ? '2' : '0'} align="center" gap="2" mb="2">
          <Progress
            variant="soft"
            size="1"
            value={goodness * 100}
            color={color}
          />
          <Text color="gray" size="1">
            {betterTanks.length + 1} / {others.length}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
