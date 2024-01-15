'use client';

import { Flex } from '@radix-ui/themes';
import { produce } from 'immer';
import { use, useEffect, useState } from 'react';
import PageWrapper from '../../../../components/PageWrapper';
import { tankDefinitions } from '../../../../core/blitzkrieg/tankDefinitions';
import mutateTankopedia, { DuelMember } from '../../../../stores/tankopedia';
import { AntagonistBar } from './components/AntagonistBar';
import { TankDisplay } from './components/Model/TankDisplay';
import { Modules } from './components/Modules';
import { Title } from './components/Title';

export interface Duel {
  protagonist: DuelMember;
  antagonist: DuelMember;
}

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);
  const [duel, setDuel] = useState<Duel>({
    protagonist: {
      tank: awaitedTankDefinitions[id],
      turret: awaitedTankDefinitions[id].turrets.at(-1)!,
      gun: awaitedTankDefinitions[id].turrets.at(-1)!.guns.at(-1)!,
      shell: awaitedTankDefinitions[id].turrets.at(-1)!.guns.at(-1)!.shells[0],
    },
    antagonist: {
      tank: awaitedTankDefinitions[id],
      turret: awaitedTankDefinitions[id].turrets.at(-1)!,
      gun: awaitedTankDefinitions[id].turrets.at(-1)!.guns.at(-1)!,
      shell: awaitedTankDefinitions[id].turrets.at(-1)!.guns.at(-1)!.shells[0],
    },
  });

  useEffect(() => {
    mutateTankopedia((draft) => {
      draft.model.physical.yaw = 0;
      draft.model.physical.pitch = 0;
      draft.mode = 'model';
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === '1') {
        setDuel(
          produce<Duel>((draft) => {
            draft.antagonist.shell = draft.antagonist.gun.shells[0];
          }),
        );
      } else if (event.key === '2') {
        setDuel(
          produce<Duel>((draft) => {
            if (draft.antagonist.gun.shells[1]) {
              draft.antagonist.shell = draft.antagonist.gun.shells[1];
            }
          }),
        );
      } else if (event.key === '3') {
        setDuel(
          produce<Duel>((draft) => {
            if (draft.antagonist.gun.shells[2]) {
              draft.antagonist.shell = draft.antagonist.gun.shells[2];
            }
          }),
        );
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id]);

  return (
    <PageWrapper color="purple">
      <Flex gap="8" direction="column">
        <Flex gap="4" direction="column">
          <Title duel={duel} />
          <TankDisplay duel={duel} />
          <AntagonistBar duel={duel} setDuel={setDuel} />
          <Modules duel={duel} setDuel={setDuel} />
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
