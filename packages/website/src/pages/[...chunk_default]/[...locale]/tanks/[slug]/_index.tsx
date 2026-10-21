import { TankType } from "@blitzkit/core";
import { PageWrapper } from "../../../../../components/PageWrapper";
import { CalloutsSection } from "../../../../../components/Tankopedia/CalloutsSection";
import { CharacteristicsSection } from "../../../../../components/Tankopedia/CharacteristicsSection";
import { GameModeSection } from "../../../../../components/Tankopedia/GameModeSection";
import { GuideSection } from "../../../../../components/Tankopedia/GuideSection";
import { HeroSection } from "../../../../../components/Tankopedia/HeroSection";
import { MetaSection } from "../../../../../components/Tankopedia/MetaSection";
import { TechTreeSection } from "../../../../../components/Tankopedia/TechTreeSection";
import { VideoSection } from "../../../../../components/Tankopedia/VideoSection";
import { api } from "../../../../../core/blitzkit/api";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../../../hooks/useLocale";
import { Duel } from "../../../../../stores/duel";
import { Tankopedia } from "../../../../../stores/tankopedia";
import type { MaybeSkeletonComponentProps } from "../../../../../types/maybeSkeletonComponentProps";
import type { TankGuide } from "../../../../../types/tankGuide";

type PageProps = MaybeSkeletonComponentProps &
  LocaleAcceptorProps & {
    id: number;
    guide?: TankGuide;
  };

const [tankDefinitions, modelDefinitions] = await Promise.all([
  api.tankDefinitions(),
  api.modelDefinitions(),
]);

export function Page({ id, skeleton, locale, guide }: PageProps) {
  const tank = tankDefinitions.tanks[id];
  const model = modelDefinitions.models[id];

  Tankopedia.useInitialization(model);
  Duel.useInitialization({ tank, model });

  const protagonist = Duel.use((state) => state.protagonist.tank);

  return (
    <LocaleProvider locale={locale}>
      <PageWrapper p="0" maxWidth="unset" color="purple" gap="9" pb="9">
        <HeroSection skeleton={skeleton} />
        <MetaSection />
        <CalloutsSection />
        {protagonist.type === TankType.TANK_TYPE_RESEARCHABLE &&
          !protagonist.deprecated && (
            <TechTreeSection key={protagonist.id} skeleton={skeleton} />
          )}
        <CharacteristicsSection key={protagonist.id} skeleton={skeleton} />
        <GameModeSection />
        {guide && protagonist.id === id && <GuideSection guide={guide} />}
        <VideoSection skeleton={skeleton} />
      </PageWrapper>
    </LocaleProvider>
  );
}
