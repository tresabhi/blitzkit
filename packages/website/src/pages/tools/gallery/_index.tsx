import { GalleryList, type Avatar } from '../../../components/Gallery/List';
import { GallerySearch } from '../../../components/Gallery/Search';
import { PageWrapper } from '../../../components/PageWrapper';
import { GalleryEphemeral } from '../../../stores/galleryEphemeral';

interface PageProps {
  avatars: Avatar[];
}

export function Page({ avatars }: PageProps) {
  return (
    <PageWrapper color="gold">
      <GalleryEphemeral.Provider>
        <GallerySearch />
        <GalleryList avatars={avatars} />
      </GalleryEphemeral.Provider>
    </PageWrapper>
  );
}
