import { ASSETS_REPO } from '../../constants/assets';
import commitMultipleFiles, { FileChange } from './commitMultipleFiles';
import { assertSecret } from './secret';

export async function commitAssets(message: string, changes: FileChange[]) {
  console.log(`Committing ${message}...`);

  if (changes.length === 0) return;

  await commitMultipleFiles(
    'tresabhi',
    ASSETS_REPO,
    assertSecret(process.env.NEXT_PUBLIC_ASSET_BRANCH),
    `${message} - ${new Date().toDateString()}`,
    changes,
  );
}
