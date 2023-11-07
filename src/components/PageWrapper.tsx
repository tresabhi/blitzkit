import { Theme } from '@radix-ui/themes';
import { ComponentProps } from 'react';

interface PageWrapperProps extends ComponentProps<'div'> {
  color?: ComponentProps<typeof Theme>['accentColor'];
}

export default function PageWrapper({
  style,
  color,
  ...props
}: PageWrapperProps) {
  return (
    <Theme accentColor={color}>
      <div
        style={{
          width: '100%',
          maxWidth: 800,
          margin: 'auto',
          display: 'flex',
          padding: 16,
          flexDirection: 'column',
          gap: 16,
          boxSizing: 'border-box',

          ...style,
        }}
        {...props}
      />
    </Theme>
  );
}
