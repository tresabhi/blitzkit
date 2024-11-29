import { PageWrapper } from '../../../../components/PageWrapper';
import { CalloutsSection } from '../../../../components/Tankopedia/CalloutsSection';
import { CharacteristicsSection } from '../../../../components/Tankopedia/CharacteristicsSection';
import { GameModeSection } from '../../../../components/Tankopedia/GameModeSection';
import { HeroSection } from '../../../../components/Tankopedia/HeroSection';
import { HistorySection } from '../../../../components/Tankopedia/HistorySection';
import { MetaSection } from '../../../../components/Tankopedia/MetaSection';
import { TechTreeSection } from '../../../../components/Tankopedia/TechTreeSection';
import { VideoSection } from '../../../../components/Tankopedia/VideoSection';
import { awaitableModelDefinitions } from '../../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../../core/awaitables/tankDefinitions';
import { App } from '../../../../stores/app';
import { Duel } from '../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../stores/tankopediaPersistent';
import type { MaybeSkeletonComponentProps } from '../../../../types/maybeSkeletonComponentProps';

type PageProps = MaybeSkeletonComponentProps & {
  id: number;
};

const [tankDefinitions, provisionDefinitions, modelDefinitions] =
  await Promise.all([
    awaitableTankDefinitions,
    awaitableProvisionDefinitions,
    awaitableModelDefinitions,
  ]);

export function Page({ id, skeleton }: PageProps) {
  const tank = tankDefinitions.tanks[id];
  const model = modelDefinitions.models[id];

  return (
    <TankopediaEphemeral.Provider data={model}>
      <App.Provider>
        <TankopediaPersistent.Provider>
          <Duel.Provider
            data={{ tank, provisionDefinitions: provisionDefinitions }}
          >
            <PageWrapper p="0" maxWidth="unset" color="purple" gap="9" pb="9">
              <HeroSection skeleton={skeleton} />
              <CalloutsSection />
              <MetaSection />
              <TechTreeSection skeleton={skeleton} />
              <CharacteristicsSection />
              <GameModeSection />
              <VideoSection skeleton={skeleton} />
              <HistorySection />
            </PageWrapper>
          </Duel.Provider>
        </TankopediaPersistent.Provider>
      </App.Provider>
    </TankopediaEphemeral.Provider>
  );
}
