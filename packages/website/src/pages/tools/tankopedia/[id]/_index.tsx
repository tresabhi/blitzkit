import {
  fetchModelDefinitions,
  fetchProvisionDefinitions,
  fetchTankDefinitions,
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

const tankDefinitions = await fetchTankDefinitions();
const provisionDefinitions = await fetchProvisionDefinitions();
const modelDefinitions = await fetchModelDefinitions();

export function Page({ id }: PageProps) {
  const tank = tankDefinitions.tanks[id];
  const model = modelDefinitions.models[id];

  return (
    <TankopediaEphemeral.Provider data={model}>
      <App.Provider>
        <TankopediaPersistent.Provider>
          <Duel.Provider
            data={{ tank, provisionDefinitions: provisionDefinitions }}
          >
            <PageWrapper
              p="0"
              noMaxWidth
              color="purple"
              size={1600}
              gap="9"
              pb="9"
            >
              <HeroSection />
              <ShotDisplaySection />
              <CalloutsSection />
              <MetaSection />
              <TechTreeSection />
              <CharacteristicsSection />
              <GameModeSection />
              <VideoSection />
              <HistorySection />
            </PageWrapper>
          </Duel.Provider>
        </TankopediaPersistent.Provider>
      </App.Provider>
    </TankopediaEphemeral.Provider>
  );
}
