import commitMultipleFiles, { FileChange } from './commitMultipleFiles';

export async function commitAssets(
  message: string,
  changes: FileChange[],
  production: boolean,
) {
  console.log(`Committing ${message}...`);

  await commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    production ? 'main' : 'dev',
    `${message} - ${new Date().toDateString()}`,
    changes,
    true,
  );
}
