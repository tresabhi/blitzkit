'use client';

import {
  createDefaultSkills,
  equipmentDefinitions,
  modelDefinitions,
  provisionDefinitions,
  skillDefinitions,
  tankCharacteristics,
  tankDefinitions,
} from '@blitzkit/core';
import { PlusIcon } from '@radix-ui/react-icons';
import { Box, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { PageWrapper } from '../../../components/PageWrapper';
import { tankToCompareMember } from '../../../core/blitzkit/tankToCompareMember';
import * as CompareEphemeral from '../../../stores/compareEphemeral';
import { CompareTable } from './components/CompareTable';
import { Controls } from './components/Controls';
import { DamageWarning } from './components/DamageWarning';

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedSkillDefinitions = use(skillDefinitions);
  const searchParams = useSearchParams();
  const members = CompareEphemeral.use((state) => state.members);
  const [addTankDialogOpen, setAddTankDialogOpen] = useState(false);
  const awaitedModelDefinitions = use(modelDefinitions);
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  const crewSkills = CompareEphemeral.use((state) => state.crewSkills);
  const mutateCompareEphemeral = CompareEphemeral.useMutation();
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
            equipmentDefinitions: awaitedEquipmentDefinitions,
            provisionDefinitions: awaitedProvisionDefinitions,
            tankModelDefinition: awaitedModelDefinitions[thisMember.tank.id],
          },
        ),
      ),
    [members, crewSkills],
  );
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  useEffect(() => {
    router.push(
      pathname +
        '?' +
        createQueryString(
          'tanks',
          members.map(({ tank }) => tank.id).join(','),
        ),
    );
  }, [members]);

  useEffect(() => {
    const tanksParam = searchParams.get('tanks');

    if (tanksParam) {
      mutateCompareEphemeral((draft) => {
        draft.members = tanksParam
          .split(',')
          .map(Number)
          .map((id) =>
            tankToCompareMember(
              awaitedTankDefinitions[id],
              awaitedProvisionDefinitions,
            ),
          );
      });
    }

    if (Object.keys(crewSkills).length === 0) {
      mutateCompareEphemeral((draft) => {
        draft.crewSkills = createDefaultSkills(awaitedSkillDefinitions);
      });
    }
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
