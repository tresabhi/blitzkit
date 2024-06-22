import { ComponentProps } from 'react';

export function ClassHeavy(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_70_177)">
        <g clipPath="url(#clip1_70_177)">
          <rect
            y="32"
            width="45.2548"
            height="12.4183"
            rx="6.20914"
            transform="rotate(-45 0 32)"
            fill="currentColor"
          />
          <rect
            x="11.6095"
            y="43.6095"
            width="45.2548"
            height="12.4183"
            rx="6.20914"
            transform="rotate(-45 11.6095 43.6095)"
            fill="currentColor"
          />
          <rect
            x="23.2189"
            y="55.219"
            width="45.2548"
            height="12.4183"
            rx="6.20914"
            transform="rotate(-45 23.2189 55.219)"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_70_177">
          <rect width="64" height="64" fill="white" />
        </clipPath>
        <clipPath id="clip1_70_177">
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
