'use client';

import { useEffect } from 'react';
import { AdMidSectionResponsive } from '../../../../components/AdMidSectionResponsive';
import PageWrapper from '../../../../components/PageWrapper';
import { assignDuelMember } from '../../../../core/blitzkit/assignDuelMember';
import { useAdExempt } from '../../../../hooks/useAdExempt';
import { mutateDuel, useDuel } from '../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../stores/tankopediaEphemeral';
import { HistorySection } from './components/HistorySection';
import { CharacteristicsSection } from './components/Model/CharacteristicsSection';
import { HeroSection } from './components/Model/HeroSection';
import { TechTreeSection } from './components/Model/TechTreeSection';
import { ShotDisplaySection } from './components/ShotDisplaySection';
import { VideoSection } from './components/VideoSection';

export default function Page({ params }: { params: { id: string } }) {
  const initialId = parseInt(params.id);
  const assigned = useDuel((state) => state.assigned);
  const exempt = useAdExempt();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();

  useEffect(() => {
    assignDuelMember('both', initialId);

    function handleKeyDown(event: KeyboardEvent) {
      if (document.activeElement instanceof HTMLInputElement) return;

      function wipeShot() {
        mutateTankopediaEphemeral((draft) => {
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

  useEffect(() => {
    const unsubscribe = useDuel.subscribe(
      (state) => state.protagonist?.tank.id,
      () => {
        mutateTankopediaEphemeral((draft) => {
          draft.shot = undefined;
        });
      },
    );

    return unsubscribe;
  }, []);

  return (
    <PageWrapper p="0" noMaxWidth color="purple" size={1600}>
      {assigned && (
        <>
          <HeroSection />
          <ShotDisplaySection />
          {!exempt && <AdMidSectionResponsive />}
          <CharacteristicsSection />
          {!exempt && <AdMidSectionResponsive />}
          <TechTreeSection />
          <VideoSection />
          {!exempt && <AdMidSectionResponsive />}
          <HistorySection />
        </>
      )}
    </PageWrapper>
  );
}
