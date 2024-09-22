import { useStore, type StoreKeys } from '@nanostores/react';
import type { Store } from 'nanostores';

export function useStoreKey<Type, Key extends StoreKeys<Store<Type>>>(
  store: Store<Type>,
  key: Key,
) {
  const state = useStore(store, { keys: [key] });
  return state[key];
}
