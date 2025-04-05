import { Box, type BoxProps } from '@radix-ui/themes';
import { forwardRef } from 'react';
import { Var } from '../../../../../../../../core/radix/var';

// const DOTS = 32;

type TargetCircleProps = BoxProps & {
  variant: 'client' | 'server';
};

export const TargetCircle = forwardRef<HTMLDivElement, TargetCircleProps>(
  ({ style, variant, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        position="absolute"
        top="50%"
        left="50%"
        minWidth={variant === 'client' ? '23px' : undefined}
        minHeight={variant === 'client' ? '23px' : undefined}
        style={{
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          outline: `${variant === 'client' ? 2 : 1}px solid ${variant === 'client' ? Var('grass-11') : Var('gray-11')}`,
          outlineOffset: `-${variant === 'client' ? 1 : 0.5}px`,
          ...style,
        }}
        {...props}
      >
        {/* {variant === 'client' &&
          times(DOTS, (index) => {
            const angle = 2 * Math.PI * (index / DOTS);

            return (
              <Box
                key={index}
                style={{
                  borderRadius: '50%',
                  background: Var('grass-11'),
                  transform: `translate(-50%, -50%)`,
                  position: 'absolute',
                }}
                top={`${(0.5 * Math.sin(angle) + 0.5) * 100}%`}
                left={`${(0.5 * Math.cos(angle) + 0.5) * 100}%`}
                width={'calc(1rem / 6)'}
                height={'calc(1rem / 6)'}
              />
            );
          })} */}

        <Box
          width="1rem"
          height="1rem"
          position="absolute"
          top="50%"
          left="50%"
          style={{
            backgroundImage: 'url(/assets/images/icons/aim-caret.png)',
            backgroundSize: 'contain',
            transform: 'translateX(-50%)',
            borderRadius: '50%',
          }}
        />
      </Box>
    );
  },
);
