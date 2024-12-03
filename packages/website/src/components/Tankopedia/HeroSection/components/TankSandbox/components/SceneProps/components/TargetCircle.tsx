import { imgur } from '@blitzkit/core';
import { Box, type BoxProps } from '@radix-ui/themes';
import { forwardRef } from 'react';
import { Var } from '../../../../../../../../core/radix/var';

export const TargetCircle = forwardRef<HTMLDivElement, BoxProps>(
  ({ style, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        width="10em"
        height="10em"
        style={{
          borderRadius: '50%',
          border: `0.125rem solid ${Var('green-9')}`,
          ...style,
        }}
        position="relative"
        {...props}
      >
        <Box
          width="1rem"
          height="1rem"
          position="absolute"
          top="50%"
          left="50%"
          style={{
            backgroundImage: `url(${imgur('kU9Xejd')})`,
            backgroundSize: 'contain',
            transform: 'translateX(-50%) scale(90%)',
            borderRadius: '50%',
          }}
        />
      </Box>
    );
  },
);
