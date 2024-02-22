'use client';

import { Flex } from '@radix-ui/themes';
import { use, useEffect } from 'react';
import PageWrapper from '../../../../components/PageWrapper';
import { availableProvisions } from '../../../../core/blitzkrieg/availableProvisions';
import { tankDefinitions } from '../../../../core/blitzkrieg/tankDefinitions';
import { useWideFormat } from '../../../../hooks/useWideFormat';
import { mutateDuel, useDuel } from '../../../../stores/duel';
import { mutateTankopediaTemporary } from '../../../../stores/tankopedia';
import { AntagonistBar } from './components/AntagonistBar';
import { Characteristics } from './components/Characteristics';
import { Consumables } from './components/Characteristics/components/Consumables';
import { Equipments } from './components/Characteristics/components/Equipments';
import { Miscellaneous } from './components/Characteristics/components/Miscellaneous';
import { Modules } from './components/Characteristics/components/Modules';
import { Provisions } from './components/Characteristics/components/Provisions';
import { TankSandbox } from './components/Model/TankSandbox';
import { Title } from './components/Title';

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = awaitedTankDefinitions[id];
  const gun = tank.turrets.at(-1)!.guns.at(-1)!;
  const provisionsList = use(availableProvisions(tank, gun));
  const assigned = useDuel((state) => state.assigned);
  const wideFormat = useWideFormat();

  useEffect(() => {
    mutateDuel((draft) => {
      draft.assigned = true;
      draft.protagonist = {
        tank,
        engine: tank.engines.at(-1)!,
        turret: tank.turrets.at(-1)!,
        gun,
        shell: tank.turrets.at(-1)!.guns.at(-1)!.shells[0],
        track: tank.tracks.at(-1)!,
      };
      draft.antagonist = { ...draft.protagonist };
    });

    mutateTankopediaTemporary((draft) => {
      draft.model.pose.yaw = 0;
      draft.model.pose.pitch = 0;
      draft.consumables = [];
      draft.provisions = provisionsList
        .filter((provision) => provision.crew !== undefined)
        .map((provision) => provision.id);
      draft.shot = undefined;
      draft.equipmentMatrix = [
        [1, -1, -1],
        [0, 0, 0],
        [0, 0, 0],
      ];
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (document.activeElement instanceof HTMLInputElement) return;

      function wipeShot() {
        mutateTankopediaTemporary((draft) => {
          draft.shot = undefined;
        });
      }

      if (event.key === '1') {
        wipeShot();
        mutateDuel((draft) => {
          draft.antagonist!.shell = draft.antagonist!.gun.shells[0];
        });
      } else if (event.key === '2') {
        wipeShot();
        mutateDuel((draft) => {
          if (draft.antagonist!.gun.shells[1]) {
            draft.antagonist!.shell = draft.antagonist!.gun.shells[1];
          }
        });
      } else if (event.key === '3') {
        wipeShot();
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
            direction={wideFormat ? 'row' : 'column'}
            align="start"
            justify="center"
          >
            <Flex
              gap="4"
              direction="column"
              style={{
                flex: 1,
                width: '100%',
                top: 64,
                position: wideFormat ? 'sticky' : undefined,
              }}
            >
              <TankSandbox />
              <AntagonistBar />

              <Flex direction="column" gap="4">
                <Modules />
                <Provisions />
                <Equipments />
                <Miscellaneous />
                <Consumables />
              </Flex>
            </Flex>

            <Flex style={{ width: wideFormat ? 320 : '100%' }}>
              <Characteristics />
            </Flex>
          </Flex>
        </>
      )}
    </PageWrapper>
  );
}
