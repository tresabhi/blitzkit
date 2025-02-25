using System.Diagnostics;
using System.Net;
using BlitzKit.CLI.Utils;
using DotNetEnv;
using Octokit;

namespace BlitzKit.CLI.Models
{
  public static class BlitzKitAssets
  {
    private static int TIME_PER_BLOB = (int)Math.Pow(2, 4) * 10000;
    private static int TIME_BETWEEN_BLOBS = (int)(60 * 60 * 1000 / 5000 / 0.9);

    public static async Task CommitAssets(string message, List<FileChange> changes)
    {
      Console.WriteLine($"Committing \"{message}\"... with {changes.Count} proposed changes");

      if (changes.Count == 0)
        return;

      await CommitMultipleFiles(
        Env.GetString("PUBLIC_ASSET_REPO"),
        Env.GetString("PUBLIC_ASSET_BRANCH"),
        message,
        changes
      );
    }

    public static async Task CommitMultipleFiles(
      string repoRaw,
      string branch,
      string message,
      List<FileChange> changesRaw
    )
    {
      using HttpClient httpClient = new();

      GitHubClient octokit = new(new ProductHeaderValue("MyAmazingApp"))
      {
        Credentials = new(Env.GetString("GH_TOKEN")),
      };
      List<FileChange> changes = [];

      await Task.WhenAll(
        changesRaw
          .Select(async change =>
          {
            var blobPath = $"{repoRaw}/{branch}/{change.Path}";

            HttpResponseMessage response = await httpClient.GetAsync(
              $"https://raw.githubusercontent.com/{blobPath}"
            );

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
              Console.WriteLine(
                $"🟢 (+{change.Content.Count.ToString("N0", Program.Culture)}B) {blobPath}"
              );
              changes.Add(change);
            }
            else if (response.StatusCode == HttpStatusCode.OK)
            {
              var bytes = await response.Content.ReadAsByteArrayAsync();

              // we discard blob if they're the same size; it's unlikely their
              // contents will be different; I love playing russian roulette!
              var equal =
                bytes.Length == change.Content.Count || bytes.SequenceEqual([.. change.Content]);
              if (!equal)
              {
                var diff = change.Content.Count - bytes.Length;

                Console.WriteLine(
                  $"🟡 ({(diff > 0 ? '+' : "")}{diff.ToString("N0", Program.Culture)}B) {blobPath}"
                );

                changes.Add(change);
              }
            }
            else
            {
              throw new Exception($"Unexpected status code {response.StatusCode} for {blobPath}");
            }
          })
          .ToList()
      );

      if (changes.Count == 0)
        return;

      var repoRawSplit = repoRaw.Split('/');
      var owner = repoRawSplit[0];
      var repo = repoRawSplit[1];
      var latestCommitSha = (await octokit.Git.Reference.Get(owner, repo, $"heads/{branch}"))
        .Object
        .Sha;
      var treeSha = (await octokit.Git.Commit.Get(owner, repo, latestCommitSha)).Tree.Sha;
      NewTree newTree = new() { BaseTree = treeSha };

      foreach (var change in changes)
      {
        Console.WriteLine($"blobbing {change.Path}");

        while (true)
        {
          try
          {
            var stopwatch = Stopwatch.StartNew();
            var blobSha = octokit
              .Git.Blob.Create(
                owner,
                repo,
                new()
                {
                  Encoding = EncodingType.Base64,
                  Content = Convert.ToBase64String(change.Content),
                }
              )
              .Result.Sha;

            await Task.Delay((int)Math.Max(0, TIME_BETWEEN_BLOBS - stopwatch.ElapsedMilliseconds));

            newTree.Tree.Add(
              new()
              {
                Sha = blobSha,
                Path = change.Path,
                Mode = "100644",
                Type = TreeType.Blob,
              }
            );

            break;
          }
          catch
          {
            PrettyLog.Warn($"Failed blob {change.Path}; retrying in {TIME_PER_BLOB}ms...");
            await Task.Delay(TIME_PER_BLOB);
          }
        }
      }

      var treeData = await octokit.Git.Tree.Create(owner, repo, newTree);
      var newCommit = await octokit.Git.Commit.Create(
        owner,
        repo,
        new(message, treeData.Sha, latestCommitSha)
      );
      await octokit.Git.Reference.Update(owner, repo, $"heads/{branch}", new(newCommit.Sha, true));
    }
  }

  public class GithubChangeBlob
  {
    public required string Sha;
    public required string Path;
    public required string Mode;
    public required string Type;
  }

  public class FileChange(string path, ArraySegment<byte> content)
  {
    public string Path = path;
    public ArraySegment<byte> Content = content;
  }
}
