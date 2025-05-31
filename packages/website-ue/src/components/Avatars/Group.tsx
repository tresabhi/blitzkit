import {
  ProfileAvatarComponent_Category,
  type ProfileAvatarComponent,
} from '@protos/blitz_static_profile_avatar_component';
import type { SellableComponent } from '@protos/blitz_static_sellable_component';
import { Grade } from '@protos/blitz_static_standard_grades_enum';
import type { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import { DownloadIcon, StarFilledIcon } from '@radix-ui/react-icons';
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Text,
  type BadgeProps,
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

export function AvatarGroup(props: AvatarGroupProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Content {...props} />
      </Dialog.Trigger>

      <Dialog.Content>
        <Popup {...props} />
      </Dialog.Content>
    </Dialog.Root>
  );
}

const CATEGORY_COLORS: Record<
  ProfileAvatarComponent_Category,
  BadgeProps['color']
> = {
  [ProfileAvatarComponent_Category.CATEGORY_UNSPECIFIED]: 'gray',
  [ProfileAvatarComponent_Category.CATEGORY_PREMUM]: 'gray',
  [ProfileAvatarComponent_Category.CATEGORY_SPECIAL]: 'gray',
  [ProfileAvatarComponent_Category.CATEGORY_ACCUMULATIVE]: 'gray',
  [ProfileAvatarComponent_Category.CATEGORY_OTHER]: 'gray',
  [ProfileAvatarComponent_Category.CATEGORY_TEMPORARY]: 'gray',
};
const GRADE_COLORS = {
  [Grade.GRADE_UNSPECIFIED]: 'gray',
  [Grade.GRADE_COMMON]: 'gray',
  [Grade.GRADE_RARE]: 'blue',
  [Grade.GRADE_EPIC]: 'purple',
  [Grade.GRADE_LEGENDARY]: 'amber',
} satisfies Record<Grade, BadgeProps['color']>;

function Popup({ name, avatars }: AvatarGroupProps) {
  const { strings, gameStrings } = useLocale();

  return (
    <>
      <Dialog.Title>{name}</Dialog.Title>

      <Flex direction="column" gap="3" mt="5">
        {avatars.map(({ avatar, stuff }, index) => (
          <Flex key={index} gap="5">
            <Box
              m="1"
              mb="4"
              height="10rem"
              style={{
                aspectRatio: '7 / 8',
                borderRadius: Var('radius-4'),
                outline: `${Var('space-1')} solid ${Var(`${GRADE_COLORS[stuff.grade]}-9`)}`,
                boxShadow: `0 0 ${
                  1.5 * (stuff.grade / Grade.GRADE_LEGENDARY)
                }rem ${Var(`${GRADE_COLORS[stuff.grade]}-9`)}`,
                backgroundImage: `url(${avatar.avatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              position="relative"
            >
              <Badge
                mt="1"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                variant="solid"
                color={GRADE_COLORS[stuff.grade]}
              >
                <StarFilledIcon /> {strings.common.grades[stuff.grade]}
              </Badge>
            </Box>

            <Flex direction="column" gap="3" justify="center">
              <Text>
                {gameStrings[stuff.description] ??
                  (gameStrings[stuff.obtaining_methods]
                    ? undefined
                    : strings.website.tools.avatars.no_description)}{' '}
                {gameStrings[stuff.obtaining_methods]}
              </Text>

              <Flex>
                <Button variant="outline">
                  <DownloadIcon /> {strings.website.tools.avatars.download}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </>
  );
}

const dx = '4px';
const MAX_AVATARS_PREVIEW = 5;

function Content({ avatars, name, ...props }: FlexProps & AvatarGroupProps) {
  const { strings } = useLocale();
  const avatarsReduced = [...avatars].slice(-MAX_AVATARS_PREVIEW);

  return (
    <Flex direction="column" gap="3" style={{ cursor: 'pointer' }} {...props}>
      <Box width="100%" style={{ aspectRatio: '7 / 8' }} position="relative">
        {avatarsReduced.map((avatar, index) => (
          <Box
            key={index}
            position="absolute"
            top={`calc(${dx} * ${index})`}
            left={`calc(${dx} * ${index})`}
            width={`calc(100% - ${dx} * ${avatarsReduced.length - 1})`}
            height={`calc(100% - ${dx} * ${avatarsReduced.length - 1})`}
            style={{
              filter: `brightness(${(index + 1) / avatarsReduced.length})`,
              borderRadius: Var('radius-4'),
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
