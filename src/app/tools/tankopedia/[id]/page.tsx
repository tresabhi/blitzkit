'use client';

import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Button, Flex, Heading, Text, Theme, Tooltip } from '@radix-ui/themes';
import Link from 'next/link';
import { use, useEffect } from 'react';
import { Flag } from '../../../../components/Flag';
import PageWrapper from '../../../../components/PageWrapper';
import { asset } from '../../../../core/blitzkrieg/asset';
import {
  TIER_ROMAN_NUMERALS,
  tankDefinitions,
} from '../../../../core/blitzkrieg/tankDefinitions';
import mutateTankopedia, { useTankopedia } from '../../../../stores/tankopedia';
import { TankDisplay } from './components/Model/TankDisplay';
import { VersusBar } from './components/VersusBar';

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);

  useEffect(() => {
    mutateTankopedia((draft) => {
      draft.model.hullYaw = 0;
      draft.model.turretYaw = 0;
      draft.model.gunPitch = 0;
      draft.mode = 'armor';
      draft.areTanksAssigned = true;

      if (!draft.areTanksAssigned) return;

      draft.protagonist = {} as typeof draft.protagonist;
      draft.protagonist.tank = awaitedTankDefinitions[id];
      draft.protagonist.turret = draft.protagonist.tank.turrets.at(-1)!;
      draft.protagonist.gun = draft.protagonist.turret.guns.at(-1)!;
      draft.antagonist = {
        ...draft.protagonist,
        shell: draft.protagonist.gun.shells[0],
      };
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
    // goofy ahh typescript discriminator hack
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
          <VersusBar />

          <Theme radius="small">
            <Flex gap="4">
              <Flex gap="1">
                {protagonist.tank.turrets.map((thisTurret) => {
                  return (
                    <Tooltip content={thisTurret.name} key={thisTurret.id}>
                      <Button
                        onClick={() => {
                          mutateTankopedia((draft) => {
                            if (!draft.areTanksAssigned) return;
                            draft.protagonist.turret = thisTurret;
                            draft.protagonist.gun = thisTurret.guns.at(-1)!;
                          });
                        }}
                        variant={
                          protagonist.turret.id === thisTurret.id
                            ? 'solid'
                            : 'soft'
                        }
                      >
                        <img
                          src={asset('icons/modules/turret.webp')}
                          width={32}
                          height={32}
                        />
                        {TIER_ROMAN_NUMERALS[thisTurret.tier]}
                      </Button>
                    </Tooltip>
                  );
                })}
              </Flex>

              <Flex gap="1">
                {protagonist.turret.guns.map((thisGun) => {
                  return (
                    <Tooltip content={thisGun.name} key={thisGun.id}>
                      <Button
                        onClick={() => {
                          mutateTankopedia((draft) => {
                            if (!draft.areTanksAssigned) return;
                            draft.protagonist.gun = thisGun;
                          });
                        }}
                        variant={
                          protagonist.gun.id === thisGun.id ? 'solid' : 'soft'
                        }
                      >
                        <img
                          src={asset('icons/modules/gun.webp')}
                          width={32}
                          height={32}
                        />
                        {TIER_ROMAN_NUMERALS[thisGun.tier]}
                      </Button>
                    </Tooltip>
                  );
                })}
              </Flex>
            </Flex>
          </Theme>
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
