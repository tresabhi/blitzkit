import { ComponentProps } from 'react';

export function ClassMedium(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clip-path="url(#clip0_70_149)">
        <g clip-path="url(#clip1_70_149)">
          <rect
            y="32"
            width="45.2548"
            height="20.6274"
            rx="8"
            transform="rotate(-45 0 32)"
            fill="currentColor"
          />
          <rect
            x="17.4142"
            y="49.4142"
            width="45.2548"
            height="20.6274"
            rx="8"
            transform="rotate(-45 17.4142 49.4142)"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_70_149">
          <rect width="64" height="64" fill="white" />
        </clipPath>
        <clipPath id="clip1_70_149">
          <rect
            width="45.2548"
            height="45.2548"
            fill="white"
            transform="translate(0 32) rotate(-45)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
