'use client';

import { useEffect } from 'react';
import PageWrapper from '../../../../components/PageWrapper';
import { assignDuelMember } from '../../../../core/blitzkit/assignDuelMember';
import { useWideFormat } from '../../../../hooks/useWideFormat';
import { mutateDuel, useDuel } from '../../../../stores/duel';
import { mutateTankopediaTemporary } from '../../../../stores/tankopedia';
import { HeroSection } from './components/Model/HeroSection';

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
    <PageWrapper noPadding noMaxWidth color="purple" size={1600}>
      {assigned && (
        <>
          <HeroSection />
        </>
      )}
    </PageWrapper>
  );
}
