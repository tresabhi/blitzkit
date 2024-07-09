import { Draft, produce } from 'immer';
import { createContext, ReactNode, useContext, useRef } from 'react';
import { StoreApi, useStore as useStoreZustand } from 'zustand';

interface StoreProviderProps {
  children: ReactNode;
}

// idk why zustand doesn't export this
type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

export function createNextSafeStore<Store extends StoreApi<unknown>>(
  initial: () => Store,
) {
  type Type = Store extends StoreApi<infer T> ? T : never;

  const Context = createContext<Store | undefined>(undefined);

  function Provider({ children }: StoreProviderProps) {
    const storeRef = useRef<Store>();
    if (!storeRef.current) storeRef.current = initial() as Store;

    return (
      <Context.Provider value={storeRef.current}>{children}</Context.Provider>
    );
  }

  function useStore() {
    const store = useContext(Context);
    if (!store) throw new Error('useStore must be used within Provider');
    return store as Store;
  }

  function use<Slice = Type>(
    selector: (store: Type) => Slice = (state) => state as Slice,
  ) {
    const store = useStore();
    return useStoreZustand(
      store,
      selector as (state: ExtractState<Store>) => Slice,
    );
  }

  function useMutation() {
    const counterStoreContext = useStore();

    return function (recipe: (draft: Draft<Type>) => void) {
      counterStoreContext.setState(
        produce<Type>((draft) => {
          recipe(draft);
        }),
      );
    };
  }

  return { Provider, use, useMutation, useStore };
}
