import { asset } from '@blitzkit/core';
import ProgressBar from 'progress';
import { GithubChangeBlob, createBlob } from './createBlob';
import { octokit } from './octokit';

export interface FileChange {
  path: string;
  content: Buffer;
}

const heuristicFormats = ['glb', 'webp', 'jpg', 'png'];

export async function commitMultipleFiles(
  repoRaw: string,
  branch: string,
  message: string,
  changesRaw: FileChange[],
) {
  const changes: FileChange[] = [];

  await Promise.all(
    changesRaw.map(async (change) => {
      const response = await fetch(asset(change.path));
      let isNew: boolean;
      let isDifferent: boolean;
      let diff: number;

      if (response.status === 404) {
        isNew = true;
        diff = change.content.length;
        isDifferent = true;
      } else if (
        response.headers.has('Content-Length') &&
        parseInt(response.headers.get('Content-Length')!) !==
          change.content.length
      ) {
        isNew = false;
        diff =
          change.content.length -
          parseInt(response.headers.get('Content-Length')!);
        isDifferent = true;
      } else if (response.status === 200) {
        isNew = false;
        const buffer = Buffer.from(await response.arrayBuffer());

        if (buffer.equals(change.content)) {
          diff = 0;
          isDifferent = false;
        } else {
          diff = change.content.length - buffer.length;
          isDifferent = true;
        }
      } else {
        throw new Error(
          `Unexpected status code ${response.status} for ${change.path}`,
        );
      }

      /**
       * Heuristic: if it's a large blob like a .glb, a diff = 0 might end up
       * being a false positive with isDifferent = true. So, it's okay to
       * assume it's unchanged.
       */
      if (
        diff === 0 &&
        heuristicFormats.some((format) => change.path.endsWith(`.${format}`))
      ) {
        isDifferent = false;
        isNew = false;
      }

      if (isNew) {
        console.log(
          `🟢 (+${change.content.length.toLocaleString()}B) ${change.path}`,
        );
        changes.push(change);
      } else if (isDifferent) {
        console.log(
          `🟡 (${diff > 0 ? '+' : ''}${diff.toLocaleString()}B) ${change.path}`,
        );
        changes.push(change);
      } else {
        console.log(
          `🔵 (${change.content.length.toLocaleString()}B) ${change.path}`,
        );
      }
    }),
  );

  if (changes.length === 0) return;

  const [owner, repo] = repoRaw.split('/');
  const latestCommitSha = (
    await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    })
  ).data.object.sha;
  const treeSha = (
    await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    })
  ).data.tree.sha;
  const blobs: GithubChangeBlob[] = [];
  const bar = new ProgressBar('Blobs :bar', changes.length);

  for (const change of changes) {
    const createdBlob = await createBlob(owner, repo, change);
    blobs.push(createdBlob!);
    bar.tick();
  }

  const { data: treeData } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: treeSha,
    tree: blobs,
  });
  const { data: newCommitData } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: treeData.sha,
    parents: [latestCommitSha],
  });
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommitData.sha,
    force: true,
  });
}
