import { assertSecret } from '@blitzkit/core';
import { commitMultipleFiles, FileChange } from './commitMultipleFiles';

export async function commitAssets(message: string, changes: FileChange[]) {
  console.log(`Committing ${message}...`);

  if (changes.length === 0) return;

  await commitMultipleFiles(
    assertSecret(import.meta.env.PUBLIC_ASSET_REPO),
    assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH),
    `${message} - ${new Date().toDateString()}`,
    changes,
  );
}
