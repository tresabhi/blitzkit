import { ComponentProps } from 'react';

export function Block(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M40 8H24V26H40V8Z" fill="currentColor" />
      <path d="M40 38H24V56H40V38Z" fill="currentColor" />
      <path
        d="M40 26H24C21 26 21.0302 30 21 32C20.9698 34 21 38 24 38H40C37 38 36.9698 34 37 32C37.0301 30 37 26 40 26Z"
        fill="currentColor"
      />
      <path
        d="M56 33C56.5523 33 57 32.5523 57 32C57 31.4477 56.5523 31 56 31L56 33ZM37 32L47 37.7735L47 26.2265L37 32ZM56 31L46 31L46 33L56 33L56 31Z"
        fill="currentColor"
      />
    </svg>
  );
}
