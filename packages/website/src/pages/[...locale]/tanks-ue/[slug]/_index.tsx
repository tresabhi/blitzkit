import { PageWrapper } from 'packages/website/src/components/PageWrapper';
import { MetaSection } from 'packages/website/src/components/Tankopedia_ue/MetaSection';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from 'packages/website/src/hooks/useLocale';
import { App } from 'packages/website/src/stores/app';
import { TankopediaEphemeral_ue } from 'packages/website/src/stores/tankopediaEphemeral_ue';

interface PageProps extends LocaleAcceptorProps {
  tankContext: TankopediaEphemeral_ue;
}

export function Page({ localeContext, tankContext }: PageProps) {
  return (
    <LocaleProvider data={localeContext}>
      <App.Provider>
        <TankopediaEphemeral_ue.Provider data={tankContext}>
          <PageWrapper p="0" maxWidth="unset" color="purple" gap="9" pb="9">
            <MetaSection />
          </PageWrapper>
        </TankopediaEphemeral_ue.Provider>
      </App.Provider>
    </LocaleProvider>
  );
}
