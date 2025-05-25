import type { CompensationComponent } from '@protos/blitz_static_compensation_component';
import { type TankCatalogComponent } from '@protos/blitz_static_tank_component';
import { PageWrapper } from 'packages/website/src/components/PageWrapper';
import { MetaSection } from 'packages/website/src/components/Tankopedia_ue/MetaSection';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from 'packages/website/src/hooks/useLocale';
import { App } from 'packages/website/src/stores/app';
import { TankopediaEphemeral_ue } from 'packages/website/src/stores/tankopediaEphemeral_ue';

interface PageProps extends LocaleAcceptorProps {
  tank: TankCatalogComponent;
  compensation: CompensationComponent;
}

export function Page({ tank, compensation, localeContext }: PageProps) {
  return (
    <LocaleProvider {...localeContext}>
      <App.Provider>
        <TankopediaEphemeral_ue.Provider data={{ tank, compensation }}>
          <PageWrapper p="0" maxWidth="unset" color="purple" gap="9" pb="9">
            <MetaSection />
          </PageWrapper>
        </TankopediaEphemeral_ue.Provider>
      </App.Provider>
    </LocaleProvider>
  );
}
