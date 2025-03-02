using System.Text;
using System.Text.Json;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Quicktype;
using BlitzKit.CLI.Utils;
using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Pak;
using CUE4Parse.UE4.Pak.Objects;
using CUE4Parse.UE4.Readers;
using CUE4Parse.UE4.Versions;
using DotNet.Globbing;

namespace BlitzKit.CLI.Functions
{
  public static class Unpacker
  {
    private const string CONTENT_GROUP = "p14y73c7_p5e_b10gg3RS_big_play";
    private const string CONTAINERS_PATH = "../../temp/containers/";

    // this may be different from the one provided in args so check this and not args[1]
    // we don't wanna delete my local installation of the game when debugging haha!
    private const string TEMP_DEPOT_DIR = "../../temp/depot/";
    private const string WG_DLC_DOMAIN = "http://dl-wotblitz-gc.wargaming.net";
    private const string BUILD_MANIFEST_OS = "Windows";

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

      Console.WriteLine($"Downloading {manifest.PakFiles.Count} containers...");

      int done = 0;
      foreach (var pakFile in manifest.PakFiles)
      {
        var localContainerPath = Path.Combine(CONTAINERS_PATH, pakFile.FileName);
        var fullContainerURL = $"{WG_DLC_DOMAIN}/dlc/{CONTENT_GROUP}/dlc/{pakFile.RelativeUrl}";
        var response = await client.GetAsync(fullContainerURL);
        var bytes = await response.Content.ReadAsByteArrayAsync();

        Directory.CreateDirectory(CONTAINERS_PATH);
        File.WriteAllBytes(localContainerPath, bytes);
        done++;

        Console.WriteLine($"Downloaded {done}/{manifest.PakFiles.Count} containers...");
      }

      Console.WriteLine("Moving pre-bundled containers...");
      foreach (
        var file in Directory.GetFiles(Path.Combine(TEMP_DEPOT_DIR, "Blitz/Content/Paks"), "*.pak")
      )
      {
        File.Move(file, Path.Combine(CONTAINERS_PATH, Path.GetFileName(file)));
      }

      Console.WriteLine("Deleting depot...");
      Directory.Delete(TEMP_DEPOT_DIR, true);
    }

    public static async Task<DlcManifest> FetchManifest(string group, string build)
    {
      Console.WriteLine($"Fetching manifest for group {group} and build {build}");

      string url =
        $"{WG_DLC_DOMAIN}/dlc/{group}/dlc/BuildManifest-{BUILD_MANIFEST_OS}-{build}.json";
      using HttpClient client = new();
      string jsonString = await client.GetStringAsync(url);
      DlcManifest manifest =
        JsonSerializer.Deserialize<DlcManifest>(jsonString)
        ?? throw new Exception("Failed to deserialize manifest");

      return manifest;
    }
  }
}
