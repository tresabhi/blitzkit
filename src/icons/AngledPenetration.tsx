import { ComponentProps } from 'react';

export function AngledPenetration(props: ComponentProps<'svg'>) {
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
        d="M56 33C56.5523 33 57 32.5523 57 32C57 31.4477 56.5523 31 56 31V33ZM8 32L18 37.7735V26.2265L8 32ZM56 31H17V33H56V31Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M28 8H12L22 28H38L28 8ZM42 36H26L36 56H52L42 36Z"
        fill="currentColor"
      />
    </svg>
  );
}
