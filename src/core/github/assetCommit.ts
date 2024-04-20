import { GithubChangeBlob, createBlob } from '../blitzrinth/createBlob';
import { octokit } from '../blitzrinth/octokit';

export class AssetCommit {
  constructor(
    public message: string,
    public production: boolean,
  ) {}
  private blobs: GithubChangeBlob[] = [];

  async add(path: string, content: string, encoding: 'utf-8' | 'base64') {
    console.log(`Blob: adding ${path}...`);

    const blob = await createBlob('tresabhi', 'blitzkrieg-assets', {
      content,
      encoding,
      path,
    });

    this.blobs.push(blob!);
  }

  async push() {
    if (this.blobs.length === 0) return;

    const latestCommitSha = (
      await octokit.git.getRef({
        owner: 'tresabhi',
        repo: 'blitzkrieg-assets',
        ref: `heads/${this.production ? 'main' : 'dev'}`,
      })
    ).data.object.sha;
    const treeSha = (
      await octokit.git.getCommit({
        owner: 'tresabhi',
        repo: 'blitzkrieg-assets',
        commit_sha: latestCommitSha,
      })
    ).data.tree.sha;
    const blobs: GithubChangeBlob[] = [];

    const { data: treeData } = await octokit.git.createTree({
      owner: 'tresabhi',
      repo: 'blitzkrieg-assets',
      base_tree: treeSha,
      tree: blobs,
    });
    const { data: newCommitData } = await octokit.git.createCommit({
      owner: 'tresabhi',
      repo: 'blitzkrieg-assets',
      message: this.message,
      tree: treeData.sha,
      parents: [latestCommitSha],
    });
    await octokit.git.updateRef({
      owner: 'tresabhi',
      repo: 'blitzkrieg-assets',
      ref: `heads/${this.production ? 'main' : 'dev'}`,
      sha: newCommitData.sha,
    });
  }
}
