import { Flex, Text } from '@radix-ui/themes';
import fuzzysort from 'fuzzysort';
import { useMemo } from 'react';
import { GalleryEphemeral } from '../../stores/galleryEphemeral';

interface GalleryListProps {
  avatars: Avatar[];
}

export interface Avatar {
  name: string;
  id: string;
}

export function GalleryList({ avatars }: GalleryListProps) {
  const search = GalleryEphemeral.use((state) => state.search);
  const filtered = useMemo(() => {
    if (search === undefined) {
      return avatars;
    } else {
      return fuzzysort
        .go(search, avatars, { key: 'name' })
        .map((result) => result.obj);
    }
  }, [search]);

  return (
    <Flex wrap="wrap" gap="4">
      {filtered.map((avatar) => {
        return (
          <Flex key={avatar.id} direction="column" align="center" width="6rem">
            <img
              style={{
                width: '4rem',
                aspectRatio: '7 / 8',
                objectFit: 'cover',
              }}
              src={`/api/gallery/${avatar.id}.webp`}
            />
            <Text align="center" style={{ maxWidth: '100%' }}>
              {avatar.name}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
}
