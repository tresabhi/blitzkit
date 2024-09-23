import {
  modelDefinitions,
  provisionDefinitions,
  tankDefinitions,
} from '@blitzkit/core';
import { PageWrapper } from '../../../../components/PageWrapper';
import { CalloutsSection } from '../../../../components/Tankopedia/CalloutsSection';
import { CharacteristicsSection } from '../../../../components/Tankopedia/CharacteristicsSection';
import { GameModeSection } from '../../../../components/Tankopedia/GameModeSection';
import { HeroSection } from '../../../../components/Tankopedia/HeroSection';
import { HistorySection } from '../../../../components/Tankopedia/HistorySection';
import { MetaSection } from '../../../../components/Tankopedia/MetaSection';
import { ShotDisplaySection } from '../../../../components/Tankopedia/ShotDisplaySection';
import { TechTreeSection } from '../../../../components/Tankopedia/TechTreeSection';
import { VideoSection } from '../../../../components/Tankopedia/VideoSection';
import { App } from '../../../../stores/app';
import { Duel } from '../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../stores/tankopediaPersistent';

interface PageProps {
  id: number;
}

const awaitedTankDefinitions = await tankDefinitions;
const awaitedProvisionDefinitions = await provisionDefinitions;
const awaitedModelDefinitions = await modelDefinitions;

export function Page({ id }: PageProps) {
  const tank = awaitedTankDefinitions[id];
  const model = awaitedModelDefinitions[id];

  return (
    <TankopediaEphemeral.Provider data={model}>
      <App.Provider>
        <TankopediaPersistent.Provider>
          <Duel.Provider
            data={{ tank, provisionDefinitions: awaitedProvisionDefinitions }}
          >
            <PageWrapper p="0" noMaxWidth color="purple" size={1600} gap="9">
              <HeroSection />
              <ShotDisplaySection />
              <CalloutsSection />
              <MetaSection />
              <TechTreeSection />
              {/* {!exempt && <AdMidSectionResponsive />} */}
              <CharacteristicsSection />
              {/* {!exempt && <AdMidSectionResponsive />} */}
              <GameModeSection />
              <VideoSection />
              <HistorySection />
              {/* {!exempt && <AdMidSectionResponsive mb="6" />} */}
            </PageWrapper>
          </Duel.Provider>
        </TankopediaPersistent.Provider>
      </App.Provider>
    </TankopediaEphemeral.Provider>
  );
}
