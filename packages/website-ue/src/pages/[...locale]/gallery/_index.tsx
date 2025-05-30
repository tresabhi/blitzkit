import { ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import { BlitzkitAllAvatarsComponent } from '@protos/blitzkit_static_all_avatars_component';
import { Badge, Box, Flex, Grid, Text } from '@radix-ui/themes';
import { CatalogItemAccessor } from 'packages/core/src/blitz/catalogItemAccessor';
import { PageWrapper } from 'packages/website-ue/src/components/PageWrapper';
import { metadata } from 'packages/website-ue/src/core/blitz/metadata';
import { Var } from 'packages/website-ue/src/core/radix/var';
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

const dx = '4px';
const MAX_AVATARS_PREVIEW = 5;

function Content() {
  const { gameStrings, strings } = useLocale();
  const groups = useMemo(() => {
    const avatars = allAvatars
      .map((avatar) => {
        const item = new CatalogItemAccessor(avatar);
        const stuffComponent = item.get(StuffUIComponent, 'UIComponent');
        const avatarComponent = item.get(
          ProfileAvatarComponent,
          'profileAvatarComponent',
        );
        const name =
          gameStrings[stuffComponent.display_name] ??
          strings.website.tools.gallery.unnamed_avatar;

        return { avatar, name, stuffComponent, avatarComponent };
      })
      .sort((a, b) => a.stuffComponent.grade - b.stuffComponent.grade)
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
        columns="repeat(auto-fill, minmax(8rem, 1fr))"
        flow="dense"
        gapX="4"
        gapY="6"
        flexGrow="1"
      >
        {groups.map(([name, avatars]) => {
          const avatarsReduced = [...avatars]
            .reverse()
            .slice(0, MAX_AVATARS_PREVIEW);

          return (
            <Flex direction="column" gap="3" key={name}>
              <Box
                width="100%"
                style={{ aspectRatio: '1 / 1' }}
                position="relative"
              >
                {avatarsReduced.map((avatar, index) => (
                  <Box
                    position="absolute"
                    top={`calc(${dx} * ${index})`}
                    left={`calc(${dx} * ${index})`}
                    width={`calc(100% - ${dx} * ${avatarsReduced.length - 1})`}
                    height={`calc(100% - ${dx} * ${avatarsReduced.length - 1})`}
                    style={{
                      filter: `brightness(${(index + 1) / avatarsReduced.length})`,
                      borderRadius: Var('radius-2'),
                      boxShadow: Var('shadow-3'),
                      backgroundImage: `url(${avatar.avatarComponent.avatar})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))}

                {avatars.length > 1 && (
                  <Box
                    position="absolute"
                    bottom="0"
                    left="50%"
                    style={{
                      transform: 'translate(-50%, 25%)',
                    }}
                  >
                    <Badge variant="solid" color="gray" highContrast size="3">
                      x{avatars.length}
                    </Badge>
                  </Box>
                )}
              </Box>

              <Text size="2">{name}</Text>
            </Flex>
          );
        })}
      </Grid>
    </PageWrapper>
  );
}
