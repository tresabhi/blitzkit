import {
  createDefaultSkills,
  fetchEquipmentDefinitions,
  fetchModelDefinitions,
  fetchProvisionDefinitions,
  fetchSkillDefinitions,
  fetchTankDefinitions,
} from '@blitzkit/core';
import { PlusIcon } from '@radix-ui/react-icons';
import { Box, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import { useEffect, useMemo, useState } from 'react';
import { CompareTable } from '../../../components/Compare/CompareTable';
import { Controls } from '../../../components/Compare/Controls';
import { DamageWarning } from '../../../components/DamageWarning';
import { PageWrapper } from '../../../components/PageWrapper';
import { tankCharacteristics } from '../../../core/blitzkit/tankCharacteristics';
import { tankToCompareMember } from '../../../core/blitzkit/tankToCompareMember';
import { App } from '../../../stores/app';
import { CompareEphemeral } from '../../../stores/compareEphemeral';
import { ComparePersistent } from '../../../stores/comparePersistent';
import { TankopediaPersistent } from '../../../stores/tankopediaPersistent';

const modelDefinitions = await fetchModelDefinitions();
const equipmentDefinitions = await fetchEquipmentDefinitions();
const provisionDefinitions = await fetchProvisionDefinitions();
const skillDefinitions = await fetchSkillDefinitions();
const tankDefinitions = await fetchTankDefinitions();

export function Page() {
  return (
    <App.Provider>
      <TankopediaPersistent.Provider>
        <ComparePersistent.Provider>
          <CompareEphemeral.Provider
            data={createDefaultSkills(skillDefinitions)}
          >
            <Content />
          </CompareEphemeral.Provider>
        </ComparePersistent.Provider>
      </TankopediaPersistent.Provider>
    </App.Provider>
  );
}

function Content() {
  const members = CompareEphemeral.use((state) => state.members);
  const [addTankDialogOpen, setAddTankDialogOpen] = useState(false);
  const crewSkills = CompareEphemeral.use((state) => state.crewSkills);
  const stats = useMemo<ReturnType<typeof tankCharacteristics>[]>(
    () =>
      members.map((thisMember) =>
        tankCharacteristics(
          {
            ...thisMember,
            crewSkills,
            stockEngine: thisMember.tank.engines[0],
            stockGun: thisMember.tank.turrets[0].guns[0],
            stockTrack: thisMember.tank.tracks[0],
            stockTurret: thisMember.tank.turrets[0],
            applyReactiveArmor: members.some(
              (member) =>
                member.key !== thisMember.key &&
                member.consumables.includes(33),
            ),
            applyDynamicArmor: members.some(
              (member) =>
                member.key !== thisMember.key &&
                member.consumables.includes(73),
            ),
            applySpallLiner: members.some(
              (member) =>
                member.key !== thisMember.key &&
                member.provisions.includes(101),
            ),
          },
          {
            equipmentDefinitions: equipmentDefinitions,
            provisionDefinitions: provisionDefinitions,
            tankModelDefinition: modelDefinitions.models[thisMember.tank.id],
          },
        ),
      ),
    [members, crewSkills],
  );
  const mutateCompareEphemeral = CompareEphemeral.useMutation();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const tanksQuery = search.get('tanks');

    if (tanksQuery === null) return;

    const tanks = tanksQuery.split(',').map(Number);

    mutateCompareEphemeral((draft) => {
      tanks.forEach((id) => {
        const tank = tankDefinitions.tanks[id];

        if (tank === undefined) return;

        draft.members.push(tankToCompareMember(tank, provisionDefinitions));
      });
    });
  }, []);

  return (
    <PageWrapper color="crimson" size="100%">
      <Flex justify="center" gap="4" align="center" direction="column">
        <DamageWarning />
        <Controls
          addTankDialogOpen={addTankDialogOpen}
          onAddTankDialogOpenChange={setAddTankDialogOpen}
        />
      </Flex>

      {members.length > 0 && (
        <Flex justify="center">
          <Box maxWidth="100%" position="relative">
            <CompareTable stats={stats} />

            <IconButton
              style={{
                position: 'absolute',
                right: 0,
                top: 73,
                transform: 'translate(50%, -50%)',
                zIndex: 1,
              }}
              onClick={() => setAddTankDialogOpen(true)}
            >
              <PlusIcon />
            </IconButton>
          </Box>
        </Flex>
      )}

      {members.length === 0 && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          style={{ flex: 1 }}
        >
          <Heading color="gray">No tanks selected</Heading>
          <Text color="gray">
            Press the <PlusIcon /> Add button to get started
          </Text>
        </Flex>
      )}
    </PageWrapper>
  );
}
