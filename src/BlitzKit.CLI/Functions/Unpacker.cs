using System.Text;
using System.Text.Json;
using BlitzKit.CLI.Quicktype.DLCManifest;
using BlitzKit.CLI.Utils;
using CUE4Parse.FileProvider;
using CUE4Parse.UE4.Pak.Objects;
using CUE4Parse.UE4.Versions;

namespace BlitzKit.CLI.Functions
{
  public static class Unpacker
  {
    public const string CONTENT_GROUP = "p14y73c7_p5e_b10gg3RS_big_play";
    private const string CONTAINERS_PATH = "../../temp/containers/";
    private const string TEMP_DEPOT_DIR = "../../temp/depot/";
    public const string WG_DLC_DOMAIN = "http://dl-wotblitz-gc.wargaming.net";
    private const string BUILD_MANIFEST_OS = "Windows";
    private static readonly SemaphoreSlim semaphore = new(8); // Limit to 4 concurrent downloads

    public static async Task Unpack(string[] args)
    {
      if (args.Length < 2)
      {
        throw new ArgumentException("Missing required initial paks directory");
      }

      var pak0Path = Path.Combine(TEMP_DEPOT_DIR, "Blitz/Content/Paks/");
      DefaultFileProvider provider0 = new(
        directory: new DirectoryInfo(pak0Path),
        searchOption: SearchOption.TopDirectoryOnly,
        versions: new(EGame.GAME_UE5_3)
      );
      provider0.Initialize();
      provider0.Mount();
      provider0.TryFindGameFile("Blitz/Config/DefaultDlc.ini", out var defaultDlcGameFile);

      if (defaultDlcGameFile is not FPakEntry)
        throw new Exception("Failed to find DefaultDlc.ini");

      IniParser defaultDlc = new(Encoding.UTF8.GetString(defaultDlcGameFile.Read()));

      using HttpClient client = new();
      string? contentBuildId = defaultDlc.GetString("DefaultContentBuildId");

      if (string.IsNullOrEmpty(contentBuildId))
      {
        throw new Exception("Failed to read content build id from DefaultDlc.ini");
      }

      DlcManifest manifest = await FetchManifest(CONTENT_GROUP, contentBuildId);

      PrettyLog.Log($"Downloading {manifest.PakFiles.Count} containers...");

      Directory.CreateDirectory(CONTAINERS_PATH);
      List<Task> downloadTasks = new();

      foreach (var pakFile in manifest.PakFiles)
      {
        var localContainerPath = Path.Combine(CONTAINERS_PATH, pakFile.FileName);
        var fullContainerURL = $"{WG_DLC_DOMAIN}/dlc/{CONTENT_GROUP}/dlc/{pakFile.RelativeUrl}";
        downloadTasks.Add(
          DownloadFileAsync(client, fullContainerURL, localContainerPath, manifest.PakFiles.Count)
        );
      }

      await Task.WhenAll(downloadTasks);

      PrettyLog.Log("Moving pre-bundled containers...");
      foreach (
        var file in Directory.GetFiles(Path.Combine(TEMP_DEPOT_DIR, "Blitz/Content/Paks"), "*.pak")
      )
      {
        File.Move(file, Path.Combine(CONTAINERS_PATH, Path.GetFileName(file)));
      }

      PrettyLog.Log("Deleting depot...");
      Directory.Delete(TEMP_DEPOT_DIR, true);
    }

    private static async Task DownloadFileAsync(
      HttpClient client,
      string url,
      string localPath,
      int totalFiles
    )
    {
      await semaphore.WaitAsync();
      try
      {
        using HttpResponseMessage response = await client.GetAsync(
          url,
          HttpCompletionOption.ResponseHeadersRead
        );
        response.EnsureSuccessStatusCode();

        using Stream contentStream = await response.Content.ReadAsStreamAsync(),
          fileStream = new FileStream(
            localPath,
            FileMode.Create,
            FileAccess.Write,
            FileShare.None,
            8192,
            true
          );

        await contentStream.CopyToAsync(fileStream);
        PrettyLog.Log($"Downloaded {Path.GetFileName(localPath)} ({totalFiles} total)");
      }
      catch (Exception ex)
      {
        PrettyLog.Log($"Failed to download {url}: {ex.Message}");
      }
      finally
      {
        semaphore.Release();
      }
    }

    public static async Task<DlcManifest> FetchManifest(string group, string build)
    {
      PrettyLog.Log($"Fetching manifest for group {group} and build {build}");

      string url =
        $"{WG_DLC_DOMAIN}/dlc/{group}/dlc/BuildManifest-{BUILD_MANIFEST_OS}-{build}.json";
      using HttpClient client = new();
      string jsonString = await client.GetStringAsync(url);
      return JsonSerializer.Deserialize<DlcManifest>(jsonString)
        ?? throw new Exception("Failed to deserialize manifest");
    }
  }
}
