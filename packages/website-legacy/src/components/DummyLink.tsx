import { Link, LinkProps } from '@radix-ui/themes';

export function DummyLink({ href = '#', onClick, ...props }: LinkProps) {
  return (
    <Link href={href} onClick={(event) => event.preventDefault()} {...props} />
  );
}
