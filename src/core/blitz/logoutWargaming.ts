import { mutateApp } from '../../stores/app';

export function logoutWargaming() {
  mutateApp((draft) => {
    draft.logins.wargaming = undefined;
  });
}
