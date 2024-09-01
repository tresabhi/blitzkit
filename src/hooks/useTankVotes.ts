import { use, useMemo } from 'react';
import { TankVotes } from '../app/api/tank-voting/[id]/average/route';
import { unwrapBlitzkitResponse } from '../core/blitzkit/unwrapBlitzkitResponse';
import * as App from '../stores/app';

export type BlitzkitResponse<Data = undefined> =
  | {
      status: 'error';
      error: string;
      message?: unknown;
    }
  | {
      status: 'ok';
      data: Data;
    };

const cache: Record<string, Promise<TankVotes> | TankVotes> = {};

export function useTankVotes(id: number) {
  const wargaming = App.use((state) => state.logins.wargaming);
  const promise = useMemo(
    () =>
      new Promise<TankVotes>((resolve) => {
        if (id in cache) {
          resolve(cache[id]);
        } else {
          const cacheable = fetch(
            `http://localhost:3000/api/tank-voting/${id}/average${
              wargaming
                ? `?player=${wargaming.id}&token=${wargaming.token}`
                : ''
            }`,
          )
            .then(
              (response) =>
                response.json() as Promise<BlitzkitResponse<TankVotes>>,
            )
            .then(unwrapBlitzkitResponse);
          cacheable.then(resolve);

          cache[id] = cacheable;
        }
      }),
    [id, wargaming],
  );
  const votes = use(promise);

  return votes;
}
