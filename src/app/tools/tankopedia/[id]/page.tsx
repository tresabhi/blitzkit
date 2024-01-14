'use client';

import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { use, useEffect } from 'react';
import { Flag } from '../../../../components/Flag';
import { ModuleButton } from '../../../../components/ModuleButton';
import PageWrapper from '../../../../components/PageWrapper';
import { tankDefinitions } from '../../../../core/blitzkrieg/tankDefinitions';
import mutateTankopedia, { useTankopedia } from '../../../../stores/tankopedia';
import { AntagonistBar } from './components/AntagonistBar';
import { TankDisplay } from './components/Model/TankDisplay';

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);

  useEffect(() => {
    mutateTankopedia((draft) => {
      draft.model.physical.yaw = 0;
      draft.model.physical.pitch = 0;
      draft.mode = 'model';
      draft.areTanksAssigned = true;

      if (!draft.areTanksAssigned) return;

      draft.protagonist = {} as typeof draft.protagonist;
      draft.protagonist.tank = awaitedTankDefinitions[id];
      draft.protagonist.turret = draft.protagonist.tank.turrets.at(-1)!;
      draft.protagonist.gun = draft.protagonist.turret.guns.at(-1)!;
      draft.protagonist.shell = draft.protagonist.gun.shells[0];
      draft.antagonist = draft.protagonist;
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === '1') {
        mutateTankopedia((draft) => {
          if (!draft.areTanksAssigned) return;
          draft.antagonist.shell = draft.antagonist.gun.shells[0];
        });
      } else if (event.key === '2') {
        mutateTankopedia((draft) => {
          if (!draft.areTanksAssigned) return;
          if (draft.antagonist.gun.shells[1])
            draft.antagonist.shell = draft.antagonist.gun.shells[1];
        });
      } else if (event.key === '3') {
        mutateTankopedia((draft) => {
          if (!draft.areTanksAssigned) return;
          if (draft.antagonist.gun.shells[2])
            draft.antagonist.shell = draft.antagonist.gun.shells[2];
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      mutateTankopedia((draft) => {
        draft.areTanksAssigned = false;
      });

      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id]);

  const protagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.protagonist;
  });

  if (!protagonist) return null;

  return (
    <PageWrapper color="purple">
      <Flex gap="8" direction="column">
        <Flex gap="4" direction="column">
          <Flex justify="between" align="center">
            <Link
              href="/tools/tankopedia"
              style={{ color: 'unset', textDecoration: 'none' }}
            >
              <Flex gap="1" align="center">
                <ArrowLeftIcon />
                <Text>Back</Text>
              </Flex>
            </Link>

            <Flex gap="2" align="center">
              <Flag nation={protagonist.tank.nation} />
              <Heading>{protagonist.tank.name}</Heading>
            </Flex>
          </Flex>

          <TankDisplay />
          <AntagonistBar />

          <Flex gap="2">
            <Flex>
              {protagonist.tank.turrets.map((thisTurret, index) => {
                return (
                  <ModuleButton
                    key={thisTurret.id}
                    selected={protagonist.turret.id === thisTurret.id}
                    type="module"
                    module="turret"
                    tier={thisTurret.tier}
                    first={index === 0}
                    last={index === protagonist.tank.turrets.length - 1}
                    rowChild
                    onClick={() => {
                      mutateTankopedia((draft) => {
                        if (!draft.areTanksAssigned) return;

                        draft.protagonist.turret = thisTurret;
                        draft.protagonist.gun = thisTurret.guns.at(-1)!;
                        draft.protagonist.shell =
                          draft.protagonist.gun.shells[0];
                      });
                    }}
                  />
                );
              })}
            </Flex>

            <Flex>
              {protagonist.turret.guns.map((thisGun, index) => {
                return (
                  <ModuleButton
                    key={thisGun.id}
                    type="module"
                    module="gun"
                    tier={thisGun.tier}
                    selected={protagonist.gun.id === thisGun.id}
                    first={index === 0}
                    last={index === protagonist.turret.guns.length - 1}
                    rowChild
                    onClick={() => {
                      mutateTankopedia((draft) => {
                        if (!draft.areTanksAssigned) return;

                        draft.protagonist.gun = thisGun;
                        draft.protagonist.shell = thisGun.shells[0];
                      });
                    }}
                  />
                );
              })}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
