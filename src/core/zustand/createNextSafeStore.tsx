import { Draft, produce } from 'immer';
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  use as useReact,
  useRef,
} from 'react';
import { StoreApi, useStore as useStoreZustand } from 'zustand';

type StoreProviderProps<InitData> = {
  children: ReactNode;
} & (InitData extends unknown ? { data?: InitData } : { data: InitData });

// idk why zustand doesn't export this
type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

export function createNextSafeStore<Store extends StoreApi<unknown>, InitData>(
  initialize: (data: InitData) => Store | Promise<Store>,
) {
  type Type = Store extends StoreApi<infer T> ? T : never;

  const Context = createContext<Store | undefined>(undefined);

  function Provider(props: StoreProviderProps<InitData>) {
    const storeRef = useRef<Store>();
    const storePromise = useMemo(
      async () => await initialize((props as { data: InitData }).data),
      [],
    );
    const awaitedStore = useReact(storePromise);
    if (!storeRef.current) storeRef.current = awaitedStore;

    return (
      <Context.Provider value={storeRef.current}>
        {props.children}
      </Context.Provider>
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
