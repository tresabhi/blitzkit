import { PageWrapper } from '../../../../components/PageWrapper';
import { TankSearch } from '../../../../components/TankSearch';
import { LocaleProvider } from '../../../../hooks/useLocale';
import { App } from '../../../../stores/app';
import { TankopediaPersistent } from '../../../../stores/tankopediaPersistent';

interface PageProps {
  locale: string | undefined;
}

export function Page({ locale }: PageProps) {
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
