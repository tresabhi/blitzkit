import type { ComponentProps } from 'react';

export function ResearchedIcon(props: ComponentProps<'svg'>) {
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
        d="M63 25V43L48 51H60C58.5 53.6667 51.6 59 36 59L62 25H63Z"
        fill="currentColor"
      />
      <path d="M48 3L60 18L54 27L48 3Z" fill="currentColor" />
      <path
        d="M3 25V43L18 51H6C7.5 53.6667 14.4 59 30 59L4 25H3Z"
        fill="currentColor"
      />
      <path d="M18 3L6 18L12 27L18 3Z" fill="currentColor" />
    </svg>
  );
}
