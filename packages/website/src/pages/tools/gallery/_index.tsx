import { GalleryList, type Avatar } from '../../../components/Gallery/List';
import { GallerySearch } from '../../../components/Gallery/Search';
import { GalleryEphemeral } from '../../../stores/galleryEphemeral';

interface PageProps {
  avatars: Avatar[];
}

export function Page({ avatars }: PageProps) {
  return (
    <GalleryEphemeral.Provider>
      <GallerySearch />
      <GalleryList avatars={avatars} />
    </GalleryEphemeral.Provider>
  );
}
