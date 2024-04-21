'use client';

import { Flex } from '@radix-ui/themes';
import { useEffect } from 'react';
import PageWrapper from '../../../../components/PageWrapper';
import { assignDuelMember } from '../../../../core/blitzkrieg/assignDuelMember';
import { useWideFormat } from '../../../../hooks/useWideFormat';
import { mutateDuel, useDuel } from '../../../../stores/duel';
import { mutateTankopediaTemporary } from '../../../../stores/tankopedia';
import { AntagonistBar } from './components/AntagonistBar';
import { Characteristics } from './components/Characteristics';
import { Consumables } from './components/Characteristics/components/Consumables';
import { Equipment } from './components/Characteristics/components/Equipment';
import { Miscellaneous } from './components/Characteristics/components/Miscellaneous';
import { Modules } from './components/Characteristics/components/Modules';
import { Provisions } from './components/Characteristics/components/Provisions';
import { Skills } from './components/Characteristics/components/Skills';
import { TankSandbox } from './components/Model/TankSandbox';
import { Title } from './components/Title';
import { Videos } from './components/Videos';

export default function Page({ params }: { params: { id: string } }) {
  const initialId = parseInt(params.id);
  const assigned = useDuel((state) => state.assigned);
  const wideFormat = useWideFormat();

  useEffect(() => {
    assignDuelMember('both', initialId);

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
  }, [initialId, assigned]);

  return (
    <PageWrapper color="purple" size={1600}>
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
              gap="8"
              direction="column"
              style={{
                flex: 1,
                width: '100%',
                top: 64 + 16,
                position: wideFormat ? 'sticky' : undefined,
              }}
            >
              <Flex gap="4" direction="column">
                <TankSandbox />
                <AntagonistBar />
              </Flex>
              <Flex gap="5" wrap="wrap">
                <Modules />
                <Provisions />
                <Consumables />

                <Flex gap="5" wrap="wrap">
                  <Skills />
                  <Equipment />
                </Flex>

                <Miscellaneous />
              </Flex>
            </Flex>

            <Flex style={{ width: wideFormat ? 320 : '100%' }}>
              <Characteristics />
            </Flex>
          </Flex>

          <Videos />
        </>
      )}
    </PageWrapper>
  );
}
