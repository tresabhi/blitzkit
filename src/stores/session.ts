import { produce } from 'immer';
import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Region } from '../constants/regions';
import { Stat } from '../core/blitz/generateStats';

interface SessionBase {
  columns: Stat[];
}

export interface SessionTracking extends SessionBase {
  tracking: true;
  player: {
    id: number;
    region: Region;
    since: number;
  };
}

interface SessionNotTracking extends SessionBase {
  tracking: false;
}

type Session = SessionTracking | SessionNotTracking;

export const useSession = create<Session>()(
  persist(
    (set) => ({
      columns: ['battles', 'winrate', 'wn8', 'damage'],
      tracking: false,
    }),
    { name: 'session-2', merge: (a, b) => merge(b, a) },
  ),
);

export default function mutateSession(recipe: (draft: Session) => void) {
  useSession.setState(produce(recipe));
}
