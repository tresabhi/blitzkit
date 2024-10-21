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
  changes: FileChange[],
) {
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

  for (const changeIndexString in changes) {
    const changeIndex = parseInt(changeIndexString);
    const change = changes[changeIndex];
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
