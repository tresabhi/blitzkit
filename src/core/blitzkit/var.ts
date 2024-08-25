type Name =
  | `color-${'background' | `panel-${'solid' | 'translucent'}` | 'surface' | 'overlay'}`
  | `radius-${1 | 2 | 3 | 4 | 5 | 6 | 'full'}`;

export function Var(name: Name) {
  return `var(--${name})`;
}
