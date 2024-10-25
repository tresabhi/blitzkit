import { Flex, Text } from '@radix-ui/themes';
import fuzzysort from 'fuzzysort';
import { times } from 'lodash-es';
import { useMemo, useState } from 'react';
import { GalleryEphemeral } from '../../stores/galleryEphemeral';
import { GalleryCard } from './Card';

interface GalleryListProps {
  avatars: Avatar[];
}

export interface Avatar {
  name: string;
  id: string;
}

const DEFAULT_LOADED = 42;
const PREVIEW_COUNT = 14;

export function GalleryList({ avatars }: GalleryListProps) {
  const search = GalleryEphemeral.use((state) => state.search);
  const [loadedCards, setLoadedCards] = useState(DEFAULT_LOADED);
  const filtered = useMemo(() => {
    setLoadedCards(DEFAULT_LOADED);

    if (search === undefined) {
      return avatars;
    } else {
      return fuzzysort
        .go(search, avatars, { keys: ['name', 'id'] })
        .map((result) => result.obj);
    }
  }, [search]);

  return (
    <>
      <Text align="center" color="gray">
        {filtered.length.toLocaleString()} avatars
      </Text>

      <Flex wrap="wrap" gap="4" justify="center">
        {filtered.slice(0, loadedCards).map((avatar) => (
          <GalleryCard key={avatar.id} id={avatar.id} name={avatar.name} />
        ))}

        {times(
          Math.min(PREVIEW_COUNT, filtered.length - loadedCards),
          (index) => (
            <GalleryCard
              key={index}
              skeleton
              onIntersection={() => setLoadedCards((state) => state + 2)}
            />
          ),
        )}
      </Flex>
    </>
  );
}
