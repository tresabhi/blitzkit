import { CalendarIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { GalleryList, type Avatar } from '../../../components/Gallery/List';
import { GallerySearch } from '../../../components/Gallery/Search';
import { PageWrapper } from '../../../components/PageWrapper';
import { GalleryEphemeral } from '../../../stores/galleryEphemeral';

interface PageProps {
  avatars: Avatar[];
  lastUpdated: string;
}

export function Page({ avatars, lastUpdated }: PageProps) {
  return (
    <PageWrapper maxWidth="80rem" color="gold">
      <Flex justify="center">
        <Callout.Root size="1">
          <Callout.Icon>
            <CalendarIcon />
          </Callout.Icon>
          <Callout.Text>Last updated on {lastUpdated}</Callout.Text>
        </Callout.Root>
      </Flex>

      <GalleryEphemeral.Provider>
        <GallerySearch />
        <GalleryList avatars={avatars} />
      </GalleryEphemeral.Provider>
    </PageWrapper>
  );
}
