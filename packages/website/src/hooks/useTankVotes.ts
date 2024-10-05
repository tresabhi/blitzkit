import {
  unwrapBlitzkitResponse,
  type BlitzkitResponse,
  type TankVotes,
} from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { $wargamingLogin } from '../stores/wargamingLogin';

const cache: Record<string, Promise<TankVotes> | TankVotes> = {};

export function useTankVotes(id: number) {
  const [votes, setVotes] = useState<TankVotes | null>(null);
  const wargaming = useStore($wargamingLogin);

  useEffect(() => {
    if (!wargaming.token) return;

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
