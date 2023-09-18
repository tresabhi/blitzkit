import { ComponentProps } from 'react';

export default function PageWrapper({
  style,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 780,
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
  );
}
