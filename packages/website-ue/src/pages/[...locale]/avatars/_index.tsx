import { ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import { SellableComponent } from '@protos/blitz_static_sellable_component';
import { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import { BlitzkitAllAvatarsComponent } from '@protos/blitzkit_static_all_avatars_component';
import { Grid } from '@radix-ui/themes';
import { CatalogItemAccessor } from 'packages/core/src/blitz/catalogItemAccessor';
import { AvatarGroup } from 'packages/website-ue/src/components/Avatars/Group';
import { PageWrapper } from 'packages/website-ue/src/components/PageWrapper';
import { metadata } from 'packages/website-ue/src/core/blitz/metadata';
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from 'packages/website-ue/src/hooks/useLocale';
import { useMemo } from 'react';

const allAvatars = await metadata
  .get('BlitzkitAllAvatarsEntity.blitzkit_all_avatars')
  .then(
    (entity) =>
      entity.get(BlitzkitAllAvatarsComponent, 'blitzkitAllAvatarsComponent')
        .avatars,
  );

export function Page({ localeData }: LocaleAcceptorProps) {
  return (
    <LocaleProvider localeData={localeData}>
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  const { gameStrings, strings } = useLocale();
  const groups = useMemo(() => {
    const avatars = allAvatars
      .map((id) => {
        const item = new CatalogItemAccessor(id);
        const stuff = item.get(StuffUIComponent, 'UIComponent');
        const avatar = item.get(
          ProfileAvatarComponent,
          'profileAvatarComponent',
        );
        const sellable = item.get(SellableComponent, 'sellableComponent');
        const name =
          gameStrings[stuff.display_name] ??
          strings.website.tools.avatars.unnamed_avatar; // maybe move to dumb component?

        return { avatar, name, stuff, sellable };
      })
      .sort((a, b) => a.stuff.grade - b.stuff.grade)
      .sort((a, b) => a.name.localeCompare(b.name));
    const groups: Record<string, typeof avatars> = {};

    for (const avatar of avatars) {
      if (avatar.name in groups) {
        groups[avatar.name].push(avatar);
      } else {
        groups[avatar.name] = [avatar];
      }
    }

    return Object.entries(groups);
  }, []);

  return (
    <PageWrapper>
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
        {groups.map(([name, avatars]) => (
          <AvatarGroup key={name} name={name} avatars={avatars} />
        ))}
      </Grid>
    </PageWrapper>
  );
}
