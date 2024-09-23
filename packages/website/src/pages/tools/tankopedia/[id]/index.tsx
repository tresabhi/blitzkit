import {
  modelDefinitions,
  provisionDefinitions,
  tankDefinitions,
} from '@blitzkit/core';
import { PageWrapper } from '../../../../components/PageWrapper';
import { HeroSection } from '../../../../components/Tankopedia/HeroSection';
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
              {/* <ShotDisplaySection />
      <MetaSection />
      <TechTreeSection />
      {!exempt && <AdMidSectionResponsive />}
      <CalloutsSection />
      <CharacteristicsSection />
      {!exempt && <AdMidSectionResponsive />}
      <GameModeSection />
      <VideoSection />
      <HistorySection />
      {!exempt && <AdMidSectionResponsive mb="6" />} */}
            </PageWrapper>
          </Duel.Provider>
        </TankopediaPersistent.Provider>
      </App.Provider>
    </TankopediaEphemeral.Provider>
  );
}
