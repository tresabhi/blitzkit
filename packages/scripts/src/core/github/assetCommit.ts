import { assertSecret } from '@blitzkit/core';
import { octokit } from '../../../../website/src/core/blitzkit/octokit';
import { GithubChangeBlob, createBlob } from './createBlob';

export class AssetCommit {
  constructor(public message: string) {}
  private blobs: GithubChangeBlob[] = [];

  async add(path: string, content: string, encoding: 'utf-8' | 'base64') {
    console.log(`Blob: adding ${path}...`);

    const blob = await createBlob(
      'tresabhi',
      assertSecret(process.env.NEXT_PUBLIC_ASSET_REPO),
      {
        content,
        encoding,
        path,
      },
    );

    this.blobs.push(blob!);
  }

  async push() {
    if (this.blobs.length === 0) return;

    const latestCommitSha = (
      await octokit.git.getRef({
        owner: 'tresabhi',
        repo: assertSecret(process.env.NEXT_PUBLIC_ASSET_REPO),
        ref: `heads/${assertSecret(process.env.NEXT_PUBLIC_ASSET_BRANCH)}`,
      })
    ).data.object.sha;
    const treeSha = (
      await octokit.git.getCommit({
        owner: 'tresabhi',
        repo: assertSecret(process.env.NEXT_PUBLIC_ASSET_REPO),
        commit_sha: latestCommitSha,
      })
    ).data.tree.sha;
    const blobs: GithubChangeBlob[] = [];

    const { data: treeData } = await octokit.git.createTree({
      owner: 'tresabhi',
      repo: assertSecret(process.env.NEXT_PUBLIC_ASSET_REPO),
      base_tree: treeSha,
      tree: blobs,
    });
    const { data: newCommitData } = await octokit.git.createCommit({
      owner: 'tresabhi',
      repo: assertSecret(process.env.NEXT_PUBLIC_ASSET_REPO),
      message: this.message,
      tree: treeData.sha,
      parents: [latestCommitSha],
    });
    await octokit.git.updateRef({
      owner: 'tresabhi',
      repo: assertSecret(process.env.NEXT_PUBLIC_ASSET_REPO),
      ref: `heads/${assertSecret(process.env.NEXT_PUBLIC_ASSET_BRANCH)}`,
      sha: newCommitData.sha,
    });
  }
}
