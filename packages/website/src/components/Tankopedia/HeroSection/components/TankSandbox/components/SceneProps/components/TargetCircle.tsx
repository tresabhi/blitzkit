import { imgur } from '@blitzkit/core';
import { Box, type BoxProps } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { forwardRef } from 'react';
import { Var } from '../../../../../../../../core/radix/var';

const DOTS = 32;

export const TargetCircle = forwardRef<HTMLDivElement, BoxProps>(
  ({ ...props }, ref) => {
    return (
      <Box
        ref={ref}
        position="relative"
        {...props}
        minWidth="23px"
        minHeight="23px"
      >
        {times(DOTS, (index) => {
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
              width={`${1 / 6}rem`}
              height={`${1 / 6}rem`}
            />
          );
        })}
        <Box
          width="1rem"
          height="1rem"
          position="absolute"
          top="50%"
          left="50%"
          style={{
            backgroundImage: `url(${imgur('27Gwth4')})`,
            backgroundSize: 'contain',
            transform: 'translateX(-50%)',
            borderRadius: '50%',
          }}
        />
      </Box>
    );
  },
);
