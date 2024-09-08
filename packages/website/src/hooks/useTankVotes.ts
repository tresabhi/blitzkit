import { TankVotes } from '@blitzkit/core';
import { useEffect, useState } from 'react';
import { unwrapBlitzkitResponse } from '../core/blitzkit/unwrapBlitzkitResponse';
import * as App from '../stores/app';

export interface BlitzkitResponseError {
  status: 'error';
  error: string;
  message?: unknown;
}

export type BlitzkitResponse<Data = undefined> =
  | BlitzkitResponseError
  | {
      status: 'ok';
      data: Data;
    };

const cache: Record<string, Promise<TankVotes> | TankVotes> = {};

export function useTankVotes(id: number) {
  const wargaming = App.use((state) => state.logins.wargaming);
  const [votes, setVotes] = useState<TankVotes | null>(null);

  useEffect(() => {
    if (id in cache) {
      Promise.all([cache[id]]).then(([votes]) => setVotes(votes));
    } else {
      const cacheable = fetch(
        `/api/tank-voting/${id}/average${
          wargaming ? `?player=${wargaming.id}&token=${wargaming.token}` : ''
        }`,
      )
        .then(
          (response) => response.json() as Promise<BlitzkitResponse<TankVotes>>,
        )
        .then(unwrapBlitzkitResponse);
      cacheable.then(setVotes);
      cache[id] = cacheable;
    }
  }, [id, wargaming]);

  return votes;
}
