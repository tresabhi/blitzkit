import type { ComponentProps } from 'react';

export function MissingShellIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M40.8038 14L50 23.1962M13.5 38.5L25.5 50.5M60 6.77686L57.2231 4C32.2774 18.0987 20.4352 28.1445 4 50.7438C4.15427 51.3609 4.7405 53.3355 7.70248 56.2975C10.6645 59.2595 12.6391 59.8457 13.2562 60C35.8555 43.5648 45.9013 31.7226 60 6.77686Z"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
