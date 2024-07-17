import { use, useMemo } from 'react';

export function useWithDependencies<Type>(
  creator: () => Promise<Type>,
  dependencies: unknown[] = [],
) {
  const wrapper = useMemo(creator, dependencies);
  const awaited = use(wrapper);
  return awaited;
}
