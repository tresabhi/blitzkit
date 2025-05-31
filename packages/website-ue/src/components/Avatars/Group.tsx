import type { ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import type { SellableComponent } from '@protos/blitz_static_sellable_component';
import type { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import {
  Badge,
  Box,
  Dialog,
  Flex,
  Text,
  type FlexProps,
} from '@radix-ui/themes';
import { literals } from 'packages/i18n/src';
import { Var } from '../../core/radix/var';
import { useLocale } from '../../hooks/useLocale';

interface AvatarGroupProps {
  name?: string;
  avatars: {
    stuff: StuffUIComponent;
    avatar: ProfileAvatarComponent;
    sellable?: SellableComponent;
  }[];
}

const dx = '4px';
const MAX_AVATARS_PREVIEW = 5;

export function AvatarGroup({ name, avatars }: AvatarGroupProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Content avatars={avatars} name={name} />
      </Dialog.Trigger>

      <Dialog.Content>asd</Dialog.Content>
    </Dialog.Root>
  );
}

function Content({ avatars, name, ...props }: FlexProps & AvatarGroupProps) {
  const { strings } = useLocale();
  const avatarsReduced = [...avatars].reverse().slice(0, MAX_AVATARS_PREVIEW);

  return (
    <Flex direction="column" gap="3" style={{ cursor: 'pointer' }} {...props}>
      <Box width="100%" style={{ aspectRatio: '7 / 8' }} position="relative">
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
              boxShadow: Var('shadow-2'),
              backgroundImage: `url(${avatar.avatar.avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {avatars.length > 1 && (
              <Box
                width="100%"
                height="100%"
                style={{
                  background: `linear-gradient(-45deg, ${Var('black-a9')} 25%, ${Var('black-a1')} 50%)`,
                }}
              />
            )}
          </Box>
        ))}

        {avatars.length > 1 && (
          <Box position="absolute" bottom="1" right="1">
            <Badge variant="solid" color="gray" highContrast size="2">
              {literals(strings.common.units.times, [`${avatars.length}`])}
            </Badge>
          </Box>
        )}
      </Box>

      <Text
        size="2"
        wrap="nowrap"
        align="center"
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontStyle: name === undefined ? 'italic' : undefined,
        }}
      >
        {name ?? strings.website.tools.avatars.unnamed_avatars}
      </Text>
    </Flex>
  );
}
