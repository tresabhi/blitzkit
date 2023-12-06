import { octokit } from './octokit';

const TIME_PER_BLOB = 2 ** 4 * 1000;

export interface FileChange {
  path: string;
  content: string;
  encoding: 'utf-8' | 'base64';
}

export default async function commitMultipleFiles(
  owner: string,
  repo: string,
  branch: string,
  message: string,
  changes: FileChange[],
  verbose = false,
) {
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
  const blobs: {
    sha: string;
    path: string;
    mode: '100644';
    type: 'blob';
  }[] = [];

  for (const changeIndexString in changes) {
    const changeIndex = parseInt(changeIndexString);
    const change = changes[changeIndex];
    let done = false;

    while (!done) {
      try {
        const { sha } = (
          await octokit.git.createBlob({
            owner,
            repo,
            content: change.content,
            encoding: change.encoding,
          })
        ).data;

        blobs.push({ sha, path: change.path, mode: '100644', type: 'blob' });
        done = true;
      } catch (error) {
        console.warn(
          `Failed blob ${changeIndex + 1} / ${
            changes.length
          }; retrying in ${TIME_PER_BLOB}ms...`,
        );

        await new Promise((resolve) => setTimeout(resolve, TIME_PER_BLOB));
      }
    }

    if (verbose) {
      console.log(
        `Created blob ${changeIndex + 1} / ${changes.length} (${(
          (100 * (changeIndex + 1)) /
          changes.length
        ).toFixed(2)}%)`,
      );
    }
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
  });
}
