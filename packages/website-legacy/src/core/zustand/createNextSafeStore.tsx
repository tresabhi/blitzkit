'use client';

import { Draft, produce } from 'immer';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
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
  initialize: (data: InitData) => Store,
) {
  type Type = Store extends StoreApi<infer T> ? T : never;

  const Context = createContext<Store | undefined>(undefined);

  function Provider(props: StoreProviderProps<InitData>) {
    const storeRef = useRef<Store>();
    if (!storeRef.current) {
      storeRef.current = initialize((props as { data: InitData }).data);
    }

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

  function useDeferred<Slice = Type>(
    initial: Slice,
    selector: (store: Type) => Slice = (state) => state as Slice,
  ) {
    const [state, setState] = useState(initial);
    const trueState = use(selector);

    useEffect(() => {
      setState(trueState);
    }, [trueState]);

    return state;
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

  return { Provider, use, useMutation, useStore, useDeferred };
}
