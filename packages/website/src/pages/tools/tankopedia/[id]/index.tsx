import { PageWrapper } from '../../../../components/PageWrapper';
import { HeroSection } from '../../../../components/Tankopedia/HeroSection';

interface PageProps {
  id: number;
}

export function Page({ id }: PageProps) {
  return (
    <PageWrapper p="0" noMaxWidth color="purple" size={1600} gap="9">
      <HeroSection id={id} />
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
  );
}
