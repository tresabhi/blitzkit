import { type StoreKeys } from '@nanostores/react';
import type { Store } from 'nanostores';
import { useStoreKey } from './useStoreKey';

export function useStoreBoolean<Type>(
  store: Store<Type>,
  key: StoreKeys<Store<Type>>,
) {
  return Boolean(useStoreKey(store, key));
}
