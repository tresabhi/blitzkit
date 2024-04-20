import { useSession } from '../../stores/session';
import { setSession } from './setSession';

export function resetSession() {
  const session = useSession.getState();
  if (!session.isTracking) return;
  setSession(session.region, session.id, session.nickname);
}
