import { ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import { BlitzkitAllAvatarsComponent } from '@protos/blitzkit_static_all_avatars_component';
import { Flex, Text } from '@radix-ui/themes';
import { CatalogItemAccessor } from 'packages/core/src/blitz/catalogItemAccessor';
import { metadata } from 'packages/website-ue/src/core/blitz/metadata';
import { Var } from 'packages/website-ue/src/core/radix/var';
import type { LocaleAcceptorProps } from 'packages/website-ue/src/hooks/useLocale';

const allAvatars = await metadata
  .get('BlitzkitAllAvatarsEntity.blitzkit_all_avatars')
  .then(
    (entity) =>
      entity.get(BlitzkitAllAvatarsComponent, 'blitzkitAllAvatarsComponent')
        .avatars,
  );

export function Page({ localeData }: LocaleAcceptorProps) {
  return (
    <Flex wrap="wrap" gapX="4" gapY="6" justify="center" p="9">
      {allAvatars.map((avatar) => {
        const item = new CatalogItemAccessor(avatar);

        const stuffComponent = item.get(StuffUIComponent, 'UIComponent');
        const avatarComponent = item.get(
          ProfileAvatarComponent,
          'profileAvatarComponent',
        );

        return (
          <Flex
            direction="column"
            gap="2"
            key={avatar.catalog_id}
            style={{
              width: '8rem',
            }}
          >
            <img
              alt="apple sauce"
              src={avatarComponent.avatar}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'fill',
                borderRadius: Var('radius-1'),
                boxShadow: Var('shadow-2'),
              }}
            />
            <Text align="center">{stuffComponent.display_name}</Text>
          </Flex>
        );
      })}
    </Flex>
  );
}
