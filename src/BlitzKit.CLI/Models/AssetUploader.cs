using System.Collections.Concurrent;
using System.Diagnostics;
using System.Net;
using System.Threading.Tasks;
using BlitzKit.CLI.Utils;
using DotNetEnv;
using Octokit;

namespace BlitzKit.CLI.Models
{
  public class AssetUploader(string message)
  {
    private static readonly int TIME_PER_BLOB = (int)Math.Pow(2, 4) * 10000;
    private static readonly int TIME_BETWEEN_BLOBS = (int)(60 * 60 * 1000 / 5000 / 0.9);
    private static readonly int MAX_TREE_SIZE = 7_000_000; // 7MB
    private static readonly int MAX_FILE_COUNT = 64; // 7MB
    private static readonly bool devMinimizeChecks = Env.GetBool("DEV_MINIMIZE_ASSET_CHECKS");

    private readonly GitHubClient octokit = new(new ProductHeaderValue("MyAmazingApp"))
    {
      Credentials = new(Env.GetString("GH_TOKEN")),
    };
    private readonly HttpClient httpClient = new();

    private readonly string branch = Env.GetString("PUBLIC_ASSET_BRANCH");
    private readonly string repo = Env.GetString("PUBLIC_ASSET_REPO");
    public string message = message;
    private static readonly List<FileChange> changes = [];
    private int changesSize = 0;

    public async Task Add(FileChange change)
    {
      var blobPath = $"{repo}/{branch}/{change.Path}";
      HttpResponseMessage response = await httpClient.GetAsync(
        $"https://raw.githubusercontent.com/{blobPath}"
      );

      if (response.StatusCode == HttpStatusCode.NotFound)
      {
        PrettyLog.Background(
          $"🟢 (+{change.Content.Count.ToString("N0", Program.Culture)}B) {blobPath}"
        );
        changes.Add(change);
      }
      else if (response.StatusCode == HttpStatusCode.OK)
      {
        int deltaSize;
        bool isDifferent;

        // hopefully they just give you the file size to delta from
        if (response.Content.Headers.ContentLength.HasValue)
        {
          deltaSize = change.Content.Count - (int)response.Content.Headers.ContentLength;

          if (deltaSize == 0)
          {
            var bytes = await response.Content.ReadAsByteArrayAsync();
            isDifferent = !bytes.SequenceEqual(change.Content);
          }
          else
          {
            isDifferent = true;
          }
        }
        else
        {
          // the meanies didn't give us the file size so diff manually
          var bytes = await response.Content.ReadAsByteArrayAsync();
          isDifferent = !bytes.SequenceEqual(change.Content);
          deltaSize = change.Content.Count - bytes.Length;
        }

        if (isDifferent)
        {
          PrettyLog.Background(
            $"🟡 ({(deltaSize > 0 ? "+" : "")}{deltaSize.ToString("N0", Program.Culture)}B) {blobPath}"
          );
          changes.Add(change);
        }
        else
        {
          PrettyLog.Background(
            $"🔵 ({change.Content.Count.ToString("N0", Program.Culture)}B) {blobPath}"
          );
          return;
        }
      }
      else
      {
        throw new Exception($"Unexpected status code {response.StatusCode} for {blobPath}");
      }

      // flush BEFORE going over limit
      if (changesSize + change.Content.Count > MAX_TREE_SIZE || changes.Count + 1 > MAX_FILE_COUNT)
      {
        Console.WriteLine("Flushing backlog...");
        await Flush();
      }

      changes.Add(change);
      changesSize += change.Content.Count;
    }

    public async Task Flush()
    {
      if (changes.Count == 0)
        return;

      var repoRawSplit = repo.Split('/');
      var owner = repoRawSplit[0];
      var repoName = repoRawSplit[1];
      var latestCommitSha = (await octokit.Git.Reference.Get(owner, repoName, $"heads/{branch}"))
        .Object
        .Sha;
      var treeSha = (await octokit.Git.Commit.Get(owner, repoName, latestCommitSha)).Tree.Sha;
      NewTree newTree = new() { BaseTree = treeSha };

      foreach (var change in changes)
      {
        while (true)
        {
          try
          {
            var stopwatch = Stopwatch.StartNew();
            var blobSha = octokit
              .Git.Blob.Create(
                owner,
                repoName,
                new()
                {
                  Encoding = EncodingType.Base64,
                  Content = Convert.ToBase64String(change.Content),
                }
              )
              .Result.Sha;

            await Task.Delay((int)Math.Max(0, TIME_BETWEEN_BLOBS - stopwatch.ElapsedMilliseconds));

            Console.WriteLine($"blobbed {change.Path} (+{stopwatch.ElapsedMilliseconds}ms)");

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

      var treeData = await octokit.Git.Tree.Create(owner, repoName, newTree);
      var newCommit = await octokit.Git.Commit.Create(
        owner,
        repoName,
        new(message, treeData.Sha, latestCommitSha)
      );
      await octokit.Git.Reference.Update(
        owner,
        repoName,
        $"heads/{branch}",
        new(newCommit.Sha, true)
      );

      changes.Clear();
      changesSize = 0;
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
