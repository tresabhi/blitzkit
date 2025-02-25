import ProgressBar from 'progress';
import { GithubChangeBlob, createBlob } from './createBlob';
import { octokit } from './octokit';

export interface FileChange {
  path: string;
  content: Buffer;
}

export async function commitMultipleFiles(
  repoRaw: string,
  branch: string,
  message: string,
  changesRaw: FileChange[],
) {
  const changes: FileChange[] = [];

  await Promise.all(
    changesRaw.map(async (change) => {
      const blobPath = `${repoRaw}/${branch}/${change.path}`;
      const response = await fetch(
        `https://raw.githubusercontent.com/${blobPath}`,
      );

      if (response.status === 404) {
        console.log(
          `🟢 (+${change.content.length.toLocaleString()}B) ${blobPath}`,
        );
        changes.push(change);
      } else if (response.status === 200) {
        const buffer = Buffer.from(await response.arrayBuffer());

        // we discard blob if they're the same size; it's unlikely their
        // contents will be different; I love playing russian roulette!
        const equal =
          buffer.length === change.content.length ||
          buffer.equals(change.content);
        if (!equal) {
          const diff = change.content.length - buffer.length;

          console.log(
            `🟡 (${diff > 0 ? '+' : ''}${diff.toLocaleString()}B) ${blobPath}`,
          );

          changes.push(change);
        }
      } else {
        throw new Error(
          `Unexpected status code ${response.status} for ${blobPath}`,
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
