import { PageWrapper } from '../../../components/PageWrapper';
import { TankSearch } from '../../../components/TankSearch';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from '../../../hooks/useLocale';
import { App } from '../../../stores/app';
import { TankopediaPersistent } from '../../../stores/tankopediaPersistent';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';

export function Page({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  return (
    <LocaleProvider locale={locale}>
      <PageWrapper color="purple" maxWidth="80rem">
        <TankopediaPersistent.Provider>
          <App.Provider>
            <TankSearch skeleton={skeleton} />
          </App.Provider>
        </TankopediaPersistent.Provider>
      </PageWrapper>
    </LocaleProvider>
  );
}
