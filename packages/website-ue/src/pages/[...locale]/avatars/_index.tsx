import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Flex, Grid, Spinner, TextField } from '@radix-ui/themes';
import fuzzysort from 'fuzzysort';
import { debounce, times } from 'lodash-es';
import { AvatarGroup } from 'packages/website-ue/src/components/Avatars/Group';
import { PageWrapper } from 'packages/website-ue/src/components/PageWrapper';
import { api } from 'packages/website-ue/src/core/blitzkit/api';
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from 'packages/website-ue/src/hooks/useLocale';
import type { MaybeSkeletonComponentProps } from 'packages/website-ue/src/types/maybeSkeletonComponentProps';
import { useCallback, useMemo, useRef, useState } from 'react';

const { avatars } = await api.avatars();

export function Page({ localeData }: LocaleAcceptorProps) {
  return (
    <LocaleProvider localeData={localeData}>
      <Content />
    </LocaleProvider>
  );
}

const DEFAULT_LOADED = 42;
const PREVIEW_COUNT = 28;

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  const { strings, gameStrings } = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const groups = useMemo(() => {
    const avatarsSorted = avatars
      .map((avatar) => ({
        avatar,
        name: gameStrings[avatar.name] as string | undefined,
      }))
      .sort((a, b) => a.avatar.grade - b.avatar.grade)
      .sort((a, b) =>
        a.name === undefined
          ? 1
          : b.name === undefined
            ? -1
            : a.name.localeCompare(b.name),
      );
    const groups = new Map<string | undefined, typeof avatarsSorted>();

    for (const avatar of avatarsSorted) {
      if (groups.has(avatar.name)) {
        groups.get(avatar.name)!.push(avatar);
      } else {
        groups.set(avatar.name, [avatar]);
      }
    }

    return [...groups].map(([name, avatars]) => ({ name, avatars }));
  }, []);
  const [loadedAvatars, setLoadedAvatars] = useState(DEFAULT_LOADED);
  const filtered = useMemo(() => {
    setSearching(false);

    if (search === null || search.trim().length === 0) return groups;

    return fuzzysort
      .go(search, groups, { key: 'name' })
      .map((result) => result.obj);
  }, [search]);
  const requestSearch = useCallback(
    debounce(() => {
      if (!input.current) return;
      setSearch(input.current.value);
    }, 500),
    [],
  );

  return (
    <PageWrapper color="amber">
      <Flex justify="center">
        <TextField.Root
          ref={input}
          my="7"
          placeholder={strings.website.tools.avatars.search.hint}
          style={{
            flex: 1,
            maxWidth: '30rem',
          }}
          onChange={(event) => {
            if (event.target.value.trim().length === 0) {
              setSearching(false);
              return;
            }

            requestSearch();
            setSearching(true);
          }}
        >
          <TextField.Slot>
            {searching ? <Spinner /> : <MagnifyingGlassIcon />}
          </TextField.Slot>
        </TextField.Root>
      </Flex>

      <Grid
        columns={{
          initial: 'repeat(auto-fill, minmax(6rem, 1fr))',
          xs: 'repeat(auto-fill, minmax(8rem, 1fr))',
        }}
        flow="dense"
        gapX="4"
        gapY="6"
        flexGrow="1"
      >
        {filtered.slice(0, loadedAvatars).map((props) => (
          <AvatarGroup key={`${props.name}`} {...props} />
        ))}

        {times(
          skeleton
            ? DEFAULT_LOADED + PREVIEW_COUNT
            : Math.min(PREVIEW_COUNT, filtered.length - loadedAvatars),
          (index) => (
            <AvatarGroup
              key={index}
              skeleton
              onIntersection={() => setLoadedAvatars((state) => state + 2)}
            />
          ),
        )}
      </Grid>
    </PageWrapper>
  );
}
