'use client';

import { invalidate } from '@react-three/fiber';
import { useEffect } from 'react';
import { AdMidSectionResponsive } from '../../../../components/AdMidSectionResponsive';
import PageWrapper from '../../../../components/PageWrapper';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import { useAdExempt } from '../../../../hooks/useAdExempt';
import strings from '../../../../lang/en-US.json';
import * as Duel from '../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../stores/tankopediaEphemeral';
import { CalloutsSection } from './components/CalloutsSection';
import { HistorySection } from './components/HistorySection';
import { CharacteristicsSection } from './components/Model/CharacteristicsSection';
import { GameModeSection } from './components/Model/GameModeSection';
import { HeroSection } from './components/Model/HeroSection';
import { MetaSection } from './components/Model/MetaSection';
import { TechTreeSection } from './components/Model/TechTreeSection';
import { ShotDisplaySection } from './components/ShotDisplaySection';
import { VideoSection } from './components/VideoSection';

export default function Page() {
  const exempt = useAdExempt();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const mutateDuel = Duel.useMutation();
  const duelStore = Duel.useStore();
  const tank = Duel.use((state) => state.protagonist.tank);
  const title = `${tank.name} - Tier ${TIER_ROMAN_NUMERALS[tank.tier]} ${
    (strings.common.nations_adjectives as Record<string, string>)[tank.nation]
  } ${strings.common.tank_class_short[tank.class]}`;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (document.activeElement instanceof HTMLInputElement) return;

      function wipeShot() {
        mutateTankopediaEphemeral((draft) => {
          draft.shot = undefined;
        });
      }

      if (event.key === '1') {
        invalidate();
        wipeShot();
        mutateDuel((draft) => {
          draft.antagonist.shell = draft.antagonist.gun.shells[0];
        });
      } else if (event.key === '2') {
        invalidate();
        wipeShot();
        mutateDuel((draft) => {
          if (draft.antagonist.gun.shells[1]) {
            draft.antagonist.shell = draft.antagonist.gun.shells[1];
          }
        });
      } else if (event.key === '3') {
        invalidate();
        wipeShot();
        mutateDuel((draft) => {
          if (draft.antagonist.gun.shells[2]) {
            draft.antagonist.shell = draft.antagonist.gun.shells[2];
          }
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = duelStore.subscribe(
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
    <>
      <title>{title}</title>

      <PageWrapper p="0" noMaxWidth color="purple" size={1600} gap="9">
        <HeroSection />
        <ShotDisplaySection />
        <MetaSection />
        <TechTreeSection />
        {!exempt && <AdMidSectionResponsive />}
        <CalloutsSection />
        <CharacteristicsSection />
        {!exempt && <AdMidSectionResponsive />}
        <GameModeSection />
        <VideoSection />
        <HistorySection />
        {!exempt && <AdMidSectionResponsive mb="6" />}
      </PageWrapper>
    </>
  );
}
