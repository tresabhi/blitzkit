using System.Text.Json;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Quicktype;
using BlitzKit.CLI.Utils;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Pak;
using CUE4Parse.UE4.Readers;
using DotNet.Globbing;

namespace BlitzKit.CLI.Functions
{
  public static class Unpacker
  {
    private const string CONTENT_GROUP = "p14y73c7_p5e_b10gg3RS_big_play";
    private const string VFS_PATH = "../../temp/containers/";

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

      using HttpClient client = new();
      string defaultDlcPath = Path.Combine(VFS_PATH, "Blitz/Config/DefaultDlc.ini");
      IniParser iniParser = new(defaultDlcPath);
      string? contentBuildId = iniParser.GetString("DefaultContentBuildId");

      if (string.IsNullOrEmpty(contentBuildId))
      {
        throw new Exception("Failed to read content build id from DefaultDlc.ini");
      }

      Console.WriteLine($"Exploring DLC \"{contentBuildId}\" within group \"{CONTENT_GROUP}\"");

      DlcManifest manifest = await FetchManifest(CONTENT_GROUP, contentBuildId);

      Console.WriteLine("Filtering HD and non-HD containers");

      foreach (var pakFile in manifest.PakFiles)
      {
        var localContainerPath = Path.Combine(VFS_PATH, pakFile.FileName);
        var fullContainerURL = $"{WG_DLC_DOMAIN}/dlc/{CONTENT_GROUP}/dlc/{pakFile.RelativeUrl}";
        var response = await client.GetAsync(fullContainerURL);
        var bytes = await response.Content.ReadAsByteArrayAsync();

        File.WriteAllBytes(localContainerPath, bytes);
      }
    }

    public static async Task<DlcManifest> FetchManifest(string group, string build)
    {
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
