import { ASSETS_REPO } from '../../constants/assets';
import commitMultipleFiles, { FileChange } from './commitMultipleFiles';

export async function commitAssets(
  message: string,
  changes: FileChange[],
  production: boolean,
  verbose = true,
) {
  console.log(`Committing ${message}...`);

  if (changes.length === 0) return;

  await commitMultipleFiles(
    'tresabhi',
    ASSETS_REPO,
    production ? 'main' : 'dev',
    `${message} - ${new Date().toDateString()}`,
    changes,
    verbose,
  );
}
