import type { VarName } from '../../../core/radix/var';

export const tierListRows: {
  name: string;
  color: VarName;
}[] = [
  { name: 'S', color: 'tomato-9' },
  { name: 'A', color: 'orange-9' },
  { name: 'B', color: 'amber-9' },
  { name: 'C', color: 'green-9' },
  { name: 'D', color: 'blue-9' },
];

export const tierListRowElements = new Set<HTMLTableRowElement>();
export const tierListCardElements = tierListRows.map(
  () => new Set<HTMLDivElement>(),
);
