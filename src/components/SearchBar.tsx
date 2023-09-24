import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { ComponentProps, forwardRef, useImperativeHandle, useRef } from 'react';
import { theme } from '../stitches.config';

export const SearchBar = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ style, ...props }, ref) => {
    const input = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => input.current!);

    return (
      <div
        style={{
          display: 'flex',
          padding: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.componentInteractive,
          color: theme.colors.textLowContrast,
          fontSize: 16,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'text',

          ...style,
        }}
        onClick={() => input.current?.focus()}
      >
        <MagnifyingGlassIcon style={{ width: '1em', height: '1em' }} />

        <input
          {...props}
          ref={input}
          style={{
            flex: 1,
            color: theme.colors.textHighContrast,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 'inherit',
          }}
        />
      </div>
    );
  },
);
