import { Draft, produce } from 'immer';
import { Context, createContext, ReactNode, useContext, useRef } from 'react';
import { createStore, StoreApi, useStore as useStoreZustand } from 'zustand';

interface StoreProviderProps {
  children: ReactNode;
}

export function createStoreContext<Type>() {
  return createContext<StoreApi<Type> | undefined>(undefined);
}

export function createStoreProvider<Type>(
  initialState: Type,
  Context: Context<StoreApi<Type> | undefined>,
) {
  return function Provider({ children }: StoreProviderProps) {
    const storeRef = useRef<StoreApi<Type>>();
    if (!storeRef.current) {
      storeRef.current = createStore<Type>()(() => ({ ...initialState }));
    }

    return (
      <Context.Provider value={storeRef.current}>{children}</Context.Provider>
    );
  };
}

export function createNextSafeStore<Type>(initialState: Type) {
  const Context = createContext<StoreApi<Type> | undefined>(undefined);

  function Provider({ children }: StoreProviderProps) {
    const storeRef = useRef<StoreApi<Type>>();
    if (!storeRef.current) {
      storeRef.current = createStore<Type>()(() => ({ ...initialState }));
    }

    return (
      <Context.Provider value={storeRef.current}>{children}</Context.Provider>
    );
  }

  function useStore() {
    const store = useContext(Context);

    if (!store) throw new Error('useStore must be used within Provider');

    return store;
  }

  function use<Slice = Type>(
    selector: (store: Type) => Slice = (state) => state as unknown as Slice,
  ): Slice {
    const store = useStore();
    return useStoreZustand(store, selector);
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
