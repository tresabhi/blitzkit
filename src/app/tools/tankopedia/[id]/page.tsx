'use client';

import { Flex } from '@radix-ui/themes';
import { use, useEffect } from 'react';
import PageWrapper from '../../../../components/PageWrapper';
import { tankDefinitions } from '../../../../core/blitzkrieg/tankDefinitions';
import { mutateDuel, useDuel } from '../../../../stores/duel';
import { mutateTankopediaTemporary } from '../../../../stores/tankopedia';
import { AntagonistBar } from './components/AntagonistBar';
import { Characteristics } from './components/Characteristics';
import { TankSandbox } from './components/Model/TankSandbox';
import { Title } from './components/Title';

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);
  const assigned = useDuel((state) => state.assigned);

  useEffect(() => {
    mutateDuel((draft) => {
      draft.assigned = true;
      draft.protagonist = {
        tank: awaitedTankDefinitions[id],
        turret: awaitedTankDefinitions[id].turrets.at(-1)!,
        gun: awaitedTankDefinitions[id].turrets.at(-1)!.guns.at(-1)!,
        shell: awaitedTankDefinitions[id].turrets.at(-1)!.guns.at(-1)!
          .shells[0],
      };
      draft.antagonist = {
        tank: awaitedTankDefinitions[id],
        turret: awaitedTankDefinitions[id].turrets.at(-1)!,
        gun: awaitedTankDefinitions[id].turrets.at(-1)!.guns.at(-1)!,
        shell: awaitedTankDefinitions[id].turrets.at(-1)!.guns.at(-1)!
          .shells[0],
      };
    });

    mutateTankopediaTemporary((draft) => {
      draft.model.pose.yaw = 0;
      draft.model.pose.pitch = 0;
      draft.mode = 'model';
      draft.consumables = [];
      draft.provisions = [];
      draft.camouflage = false;
      draft.equipmentMatrix = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (document.activeElement instanceof HTMLInputElement) return;

      if (event.key === '1') {
        mutateDuel((draft) => {
          draft.antagonist!.shell = draft.antagonist!.gun.shells[0];
        });
      } else if (event.key === '2') {
        mutateDuel((draft) => {
          if (draft.antagonist!.gun.shells[1]) {
            draft.antagonist!.shell = draft.antagonist!.gun.shells[1];
          }
        });
      } else if (event.key === '3') {
        mutateDuel((draft) => {
          if (draft.antagonist!.gun.shells[2]) {
            draft.antagonist!.shell = draft.antagonist!.gun.shells[2];
          }
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id, assigned]);

  return (
    <PageWrapper color="purple" size="double">
      {assigned && (
        <>
          <Title />

          <Flex
            style={{ width: '100%' }}
            gap="8"
            direction="row"
            align="start"
            justify="center"
          >
            <Flex
              gap="4"
              direction="column"
              style={{
                flex: 1,
                position: 'sticky',
                top: 64,
              }}
            >
              <TankSandbox />
              <AntagonistBar />
            </Flex>

            <Characteristics />
          </Flex>
        </>
      )}
    </PageWrapper>
  );
}
