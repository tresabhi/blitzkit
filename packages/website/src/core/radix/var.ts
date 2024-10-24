import * as ColorsRaw from '@radix-ui/colors';

type ExcludeSuffix<T> =
  T extends `${string}${'A' | `${'P3' | 'Dark'}${'' | 'A'}`}` ? never : T;
type RadixColor = ExcludeSuffix<keyof typeof ColorsRaw>;

type Name =
  | `color-${'background' | `panel-${'solid' | 'translucent'}` | 'surface' | 'overlay'}`
  | `radius-${1 | 2 | 3 | 4 | 5 | 6 | 'full'}`
  | `space-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `${RadixColor | 'accent' | 'gray'}-${
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9
      | 10
      | 11
      | 12
      | 'surface'
      | 'indicator'
      | 'track'
      | 'contrast'}`;

export function Var(name: Name) {
  return `var(--${name})`;
}
