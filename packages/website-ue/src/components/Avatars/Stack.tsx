import { Badge, Box } from '@radix-ui/themes';
import { literals } from 'packages/i18n/src';
import { Var } from '../../core/radix/var';
import { useLocale } from '../../hooks/useLocale';
import type { AvatarGroupProps } from './Group';

const dx = '4px';

export function Stack({ avatars }: { avatars: AvatarGroupProps['avatars'] }) {
  const { strings } = useLocale();

  return (
    <>
      {avatars.map(({ avatar }, index) => (
        <Box
          key={index}
          position="absolute"
          top={`calc(${dx} * ${index})`}
          left={`calc(${dx} * ${index})`}
          width={`calc(100% - ${dx} * ${avatars.length - 1})`}
          height={`calc(100% - ${dx} * ${avatars.length - 1})`}
          style={{
            filter: `brightness(${(index + 1) / avatars.length})`,
            borderRadius: Var('radius-4'),
            boxShadow: Var('shadow-2'),
            overflow: 'hidden',
            backgroundImage: 'url(/assets/sad-ghost.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '3rem',
          }}
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

          {avatars.length > 1 && index === avatars.length - 1 && (
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
    </>
  );
}
