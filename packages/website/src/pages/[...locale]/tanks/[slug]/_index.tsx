import { Tank, TankArmor } from '@blitzkit/core';
import { PageWrapper } from '../../../../components/PageWrapper';
import { HeroSection } from '../../../../components/Tankopedia/HeroSection';
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
    tank: Tank;
    armor: TankArmor;
  };

export function Page({ tank, armor, skeleton, locale }: PageProps) {
  return (
    <LocaleProvider locale={locale}>
      <TankopediaEphemeral.Provider data={{ armor, thicknessRange: 193 }}>
        <App.Provider>
          <TankopediaPersistent.Provider>
            <Duel.Provider
              data={{
                tank,
                // provisionDefinitions,
              }}
            >
              <PageWrapper p="0" maxWidth="unset" color="purple" gap="9" pb="9">
                <HeroSection skeleton={skeleton} />
                {/* <CalloutsSection /> */}
                {/* <MetaSection /> */}
                {/* {tank.type === TankType.RESEARCHABLE && !tank.deprecated && (
                  <TechTreeSection skeleton={skeleton} />
                )} */}
                {/* <CharacteristicsSection /> */}
                {/* <GameModeSection /> */}
                {/* <VideoSection skeleton={skeleton} /> */}
              </PageWrapper>
            </Duel.Provider>
          </TankopediaPersistent.Provider>
        </App.Provider>
      </TankopediaEphemeral.Provider>
    </LocaleProvider>
  );
}
