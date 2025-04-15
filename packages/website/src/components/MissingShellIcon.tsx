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
        d="M39.5461 16.5714L47.4286 24.4539M16.1429 37.5714L26.4286 47.8571M56 10.3802L53.6198 8C32.2378 20.0846 22.0873 28.6952 8 48.0661C8.13223 48.595 8.63471 50.2876 11.1736 52.8264C13.7124 55.3653 15.405 55.8678 15.9339 56C35.3048 41.9127 43.9154 31.7622 56 10.3802Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
