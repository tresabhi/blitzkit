import { useRef } from 'react';
import usePromise from 'react-promise-suspense';

/**
 * A more stable alternative to `use` using `usePromise`.
 */
export function useAwait<Type>(promise: Promise<Type>) {
  const callback = useRef(async () => await promise);
  return usePromise(callback.current, []);
}
