import { Grade } from '@protos/blitz_static_standard_grades_enum';
import {
  CardStackIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeNoneIcon,
  StarFilledIcon,
} from '@radix-ui/react-icons';
import { Badge, Box, Button, Dialog, Flex, Link, Text } from '@radix-ui/themes';
import { Var } from '../../core/radix/var';
import { useLocale } from '../../hooks/useLocale';
import { RewardBadge } from '../RewardBadge';
import { GRADE_COLORS } from './Colors';
import type { AvatarGroupProps } from './Group';

export function Popup({ name, avatars }: AvatarGroupProps) {
  const { strings, gameStrings } = useLocale();

  return (
    <>
      <Dialog.Title>{name}</Dialog.Title>

      <Flex direction="column" gap="5" mt="5">
        {[...avatars].reverse().map(({ avatar }, index) => (
          <Flex key={index} gap="5">
            <Box
              m="1"
              mb="4"
              height="10rem"
              style={{
                aspectRatio: '7 / 8',
                borderRadius: Var('radius-4'),
                outline: `${Var('space-1')} solid ${Var(`${GRADE_COLORS[avatar.grade]}-9`)}`,
                boxShadow: `0 0 ${
                  1.5 * (avatar.grade / Grade.GRADE_LEGENDARY)
                }rem ${Var(`${GRADE_COLORS[avatar.grade]}-9`)}`,
                backgroundImage: 'url(/assets/sad-ghost.png)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '3rem',
              }}
              position="relative"
            >
              <Box
                width="100%"
                height="100%"
                style={{
                  backgroundImage: `url(/api/avatars/${avatar.id}.webp)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              <Badge
                mt="1"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                variant="solid"
                color={GRADE_COLORS[avatar.grade]}
              >
                <StarFilledIcon /> {strings.common.grades[avatar.grade]}
              </Badge>
            </Box>

            <Flex direction="column" gap="3" justify="center">
              <Flex gap="1">
                <Badge color="gray" variant="surface">
                  <CardStackIcon />
                  {strings.website.tools.avatars.categories[avatar.category]}
                </Badge>

                {avatar.hidden_if_not_obtained && (
                  <Badge color="gray" variant="surface">
                    <EyeNoneIcon /> {strings.website.tools.avatars.hidden}
                  </Badge>
                )}

                {avatar.sale && (
                  <RewardBadge
                    reward={avatar.sale}
                    color="gray"
                    variant="surface"
                  />
                )}
              </Flex>

              <Text>
                {gameStrings[avatar.description] ??
                  (gameStrings[avatar.obtaining]
                    ? undefined
                    : strings.website.tools.avatars.no_description)}{' '}
                {gameStrings[avatar.obtaining]}
              </Text>

              <Flex gap="2">
                <Link href={`/api/avatars/${avatar.id}.webp`} download>
                  <Button variant="solid">
                    <DownloadIcon /> {strings.website.tools.avatars.download}
                  </Button>
                </Link>

                <Link href={`/api/avatars/${avatar.id}.webp`} target="_blank">
                  <Button variant="outline">
                    <ExternalLinkIcon /> {strings.website.tools.avatars.enlarge}
                  </Button>
                </Link>
              </Flex>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </>
  );
}
