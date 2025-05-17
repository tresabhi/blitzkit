import { TankType } from '@blitzkit/core';
import { PageWrapper } from '../../../../components/PageWrapper';
import { CalloutsSection } from '../../../../components/Tankopedia/CalloutsSection';
import { CharacteristicsSection } from '../../../../components/Tankopedia/CharacteristicsSection';
import { GameModeSection } from '../../../../components/Tankopedia/GameModeSection';
import { HeroSection } from '../../../../components/Tankopedia/HeroSection';
import { MetaSection } from '../../../../components/Tankopedia/MetaSection';
import { TechTreeSection } from '../../../../components/Tankopedia/TechTreeSection';
import { VideoSection } from '../../../../components/Tankopedia/VideoSection';
import { awaitableModelDefinitions } from '../../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../../core/awaitables/tankDefinitions';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from '../../../../hooks/useLocale';
import { App } from '../../../../stores/app';
import { Duel } from '../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../stores/tankopediaPersistent';
import type { MaybeSkeletonComponentProps } from '../../../../types/maybeSkeletonComponentProps';

type PageProps = MaybeSkeletonComponentProps &
  LocaleAcceptorProps & {
    id: number;
  };

const [tankDefinitions, provisionDefinitions, modelDefinitions] =
  await Promise.all([
    awaitableTankDefinitions,
    awaitableProvisionDefinitions,
    awaitableModelDefinitions,
  ]);

export function Page({ id, skeleton, locale }: PageProps) {
  const tank = tankDefinitions.tanks[id];
  const model = modelDefinitions.models[id];

  return (
    <LocaleProvider locale={locale}>
      <TankopediaEphemeral.Provider data={model}>
        <App.Provider>
          <TankopediaPersistent.Provider>
            <Duel.Provider
              data={{ tank, model, provisionDefinitions: provisionDefinitions }}
            >
              <PageWrapper p="0" maxWidth="unset" color="purple" gap="9" pb="9">
                <HeroSection skeleton={skeleton} />
                <MetaSection />
                <CalloutsSection />
                {tank.type === TankType.RESEARCHABLE && !tank.deprecated && (
                  <TechTreeSection skeleton={skeleton} />
                )}
                <CharacteristicsSection />
                <GameModeSection />
                <VideoSection skeleton={skeleton} />
              </PageWrapper>
            </Duel.Provider>
          </TankopediaPersistent.Provider>
        </App.Provider>
      </TankopediaEphemeral.Provider>
    </LocaleProvider>
  );
}
