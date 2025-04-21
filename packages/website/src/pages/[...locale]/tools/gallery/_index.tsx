import { GalleryList } from '../../../../components/Gallery/List';
import { GallerySearch } from '../../../../components/Gallery/Search';
import { PageWrapper } from '../../../../components/PageWrapper';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from '../../../../hooks/useLocale';
import { GalleryEphemeral } from '../../../../stores/galleryEphemeral';
import type { MaybeSkeletonComponentProps } from '../../../../types/maybeSkeletonComponentProps';

export function Page({
  locale,
  ...props
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content {...props} />
    </LocaleProvider>
  );
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <PageWrapper maxWidth="80rem" color="gold">
      <GalleryEphemeral.Provider>
        <GallerySearch skeleton={skeleton} />
        <GalleryList skeleton={skeleton} />
      </GalleryEphemeral.Provider>
    </PageWrapper>
  );
}
