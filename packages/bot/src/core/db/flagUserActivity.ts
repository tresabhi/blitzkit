import { usersDatabase } from './users';

export async function flagUserActivity(blitzId: number) {
  await usersDatabase.user.upsert({
    where: { blitz_id: blitzId },
    update: {},
    create: { blitz_id: blitzId },
  });
}
