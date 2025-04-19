import { GalleryList } from '../../../../components/Gallery/List';
import { GallerySearch } from '../../../../components/Gallery/Search';
import { PageWrapper } from '../../../../components/PageWrapper';
import { awaitableGallery } from '../../../../core/awaitables/gallery';
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from '../../../../hooks/useLocale';
import { GalleryEphemeral } from '../../../../stores/galleryEphemeral';


export function Page({ locale, ...props }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content {...props} />
    </LocaleProvider>
  );
}

function Content() {

  return (
    <PageWrapper maxWidth="80rem" color="gold">
      <GalleryEphemeral.Provider>
        <GallerySearch />
        <GalleryList   />
      </GalleryEphemeral.Provider>
    </PageWrapper>
  );
}
