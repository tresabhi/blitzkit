import { Grade } from '@protos/blitz_static_standard_grades_enum';
import { DownloadIcon, StarFilledIcon } from '@radix-ui/react-icons';
import { Badge, Box, Button, Dialog, Flex, Text } from '@radix-ui/themes';
import { Var } from '../../core/radix/var';
import { useLocale } from '../../hooks/useLocale';
import { GRADE_COLORS } from './Colors';
import type { AvatarGroupProps } from './Group';

export function Popup({ name, avatars }: AvatarGroupProps) {
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
