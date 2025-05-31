import { prerelease } from 'semver';
import packageJSON from '../../../../../package.json';

export function resolveBranchName() {
  const components = prerelease(packageJSON.version);

  if (components === null) return undefined;

  return components[0];
}
