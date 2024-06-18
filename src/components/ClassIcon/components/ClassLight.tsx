import { ComponentProps } from 'react';

export function ClassLight(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        y="32"
        width="45.2548"
        height="45.2548"
        rx="8"
        transform="rotate(-45 0 32)"
        fill="currentColor"
      />
    </svg>
  );
}
