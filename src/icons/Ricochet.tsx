import { ComponentProps } from 'react';

export function Ricochet(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 8H28L52 56H36L12 8Z" fill="currentColor" />
      <path
        d="M55.4 44.8C55.8418 45.1314 56.4686 45.0418 56.8 44.6C57.1314 44.1582 57.0418 43.5314 56.6 43.2L55.4 44.8ZM40 8L34.2265 18H45.7735L40 8ZM40 32H39V32.5L39.4 32.8L40 32ZM56.6 43.2L40.6 31.2L39.4 32.8L55.4 44.8L56.6 43.2ZM41 32V17H39V32H41Z"
        fill="currentColor"
      />
    </svg>
  );
}
