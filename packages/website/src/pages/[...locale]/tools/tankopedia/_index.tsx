import { PageWrapper } from '../../../../components/PageWrapper';
import { TankSearch } from '../../../../components/TankSearch';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from '../../../../hooks/useLocale';
import { App } from '../../../../stores/app';
import { TankopediaPersistent } from '../../../../stores/tankopediaPersistent';

export function Page({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <PageWrapper color="purple" maxWidth="80rem">
        <TankopediaPersistent.Provider>
          <App.Provider>
            <TankSearch />
          </App.Provider>
        </TankopediaPersistent.Provider>
      </PageWrapper>
    </LocaleProvider>
  );
}
