import { produce } from 'immer';
import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Region } from '../constants/regions';

interface SessionBase {}

export interface SessionTracking extends SessionBase {
  tracking: true;
  player: {
    id: number;
    region: Region;
  };
}

interface SessionNotTracking extends SessionBase {
  tracking: false;
}

type Session = SessionTracking | SessionNotTracking;

export const useSession = create<Session>()(
  persist(
    (set) => ({
      tracking: false,
    }),
    { name: 'session-2', merge: (a, b) => merge(b, a) },
  ),
);

export default function mutateSession(recipe: (draft: Session) => void) {
  useSession.setState(produce(recipe));
}
