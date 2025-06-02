import { ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import { SellableComponent } from '@protos/blitz_static_sellable_component';
import { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import { BlitzkitAllAvatarsComponent } from '@protos/blitzkit_static_all_avatars_component';
import { Grid } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { CatalogItemAccessor } from 'packages/core/src/blitz/catalogItemAccessor';
import { AvatarGroup } from 'packages/website-ue/src/components/Avatars/Group';
import { PageWrapper } from 'packages/website-ue/src/components/PageWrapper';
import { metadata } from 'packages/website-ue/src/core/blitz/metadata';
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from 'packages/website-ue/src/hooks/useLocale';
import type { MaybeSkeletonComponentProps } from 'packages/website-ue/src/types/maybeSkeletonComponentProps';
import { useMemo, useState } from 'react';

const allAvatars = await metadata
  .get('BlitzkitAllAvatarsEntity.blitzkit_all_avatars')
  .then((entity) =>
    entity
      .get(BlitzkitAllAvatarsComponent, 'blitzkitAllAvatarsComponent')
      .avatars.reverse(),
  );

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
  const { gameStrings } = useLocale();
  const groups = useMemo(() => {
    const avatars = allAvatars
      .map((id) => {
        const item = new CatalogItemAccessor(id);
        const stuff = item.get(StuffUIComponent, 'UIComponent');
        const avatar = item.get(
          ProfileAvatarComponent,
          'profileAvatarComponent',
        );
        const sellable = item.getOptional(
          SellableComponent,
          'sellableComponent',
        );
        const name = gameStrings[stuff.display_name] as string | undefined;

        return { avatar, name, stuff, sellable };
      })
      .sort((a, b) => a.stuff.grade - b.stuff.grade)
      .sort((a, b) =>
        a.name === undefined
          ? 1
          : b.name === undefined
            ? -1
            : a.name.localeCompare(b.name),
      );
    const groups = new Map<string | undefined, typeof avatars>();

    for (const avatar of avatars) {
      if (groups.has(avatar.name)) {
        groups.get(avatar.name)!.push(avatar);
      } else {
        groups.set(avatar.name, [avatar]);
      }
    }

    return [...groups].map(([name, avatars]) => ({ name, avatars }));
  }, []);
  const [loadedAvatars, setLoadedAvatars] = useState(DEFAULT_LOADED);
  const filtered = useMemo(() => groups, []);

  return (
    <PageWrapper color="amber">
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
