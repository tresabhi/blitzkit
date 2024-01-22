import usePromise from 'react-promise-suspense';

/**
 * A more stable alternative to `use` using `usePromise`.
 */
export function useAwait<Type>(promise: Promise<Type>) {
  return usePromise(async () => await promise, []);
}
