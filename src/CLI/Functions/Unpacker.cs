using System.Text.Json;
using CLI.Models;
using CLI.Utils;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Pak;
using CUE4Parse.UE4.Readers;

namespace CLI.Functions
{
  public static class Unpacker
  {
    private const string CONTENT_GROUP = "p14y73c7_p5e_b10gg3RS_big_play";
    private const string VFS_PATH = "../../temp/vfs/";

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

      AgnosticZlibHelper.Initialize();

      UnpackDepot(args[1]);
      await UnpackDLC();
    }

    private static async Task UnpackDLC()
    {
      string defaultDlcPath = Path.Combine(VFS_PATH, "Blitz/Config/DefaultDlc.ini");
      IniParser iniParser = new(defaultDlcPath);
      string? contentBuildId = iniParser.GetString("DefaultContentBuildId");

      if (string.IsNullOrEmpty(contentBuildId))
      {
        throw new Exception("Failed to read content build id from DefaultDlc.ini");
      }

      Console.WriteLine($"Exploring DLC {contentBuildId} within group {CONTENT_GROUP}");

      using HttpClient httpClient = new();
      DlcManifest manifest = await FetchManifest(CONTENT_GROUP, contentBuildId);

      foreach (var pakFile in manifest.PakFiles)
      {
        Console.WriteLine($"{pakFile.FileName} downloading exergy...");

        string url = $"{WG_DLC_DOMAIN}/dlc/{CONTENT_GROUP}/dlc/{pakFile.RelativeUrl}";

        // load to stream
        Stream stream = await httpClient.GetStreamAsync(url);
        FStreamArchive archive = new(url, stream);
        PakFileReader reader = new(archive);

        reader.Mount();

        foreach (var file in reader.Files)
        {
          var gameFile = file.Value;
          Console.WriteLine(gameFile.Path);
        }

        break;
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

    private static void UnpackDepot(string workingDirectory)
    {
      string paksDirectory = Path.Combine(workingDirectory, "Blitz/Content/Paks");
      string[] containers = Directory.GetFiles(paksDirectory, "*.pak");

      foreach (string container in containers)
      {
        Exergy(container);
      }

      if (Directory.Exists(TEMP_DEPOT_DIR))
      {
        Console.WriteLine("Deleting temp depots directory...");
        Directory.Delete(TEMP_DEPOT_DIR, true);
      }
    }

    private static void Exergy(string container)
    {
      Console.WriteLine($"Filtering {container}");

      PakFileReader reader = new(container);

      reader.Mount();

      foreach (var file in reader.Files)
      {
        GameFile gameFile = file.Value;
        bool exergizable = ShouldExergize(gameFile.Path);

        if (!exergizable)
        {
          continue;
        }

        string writePath = Path.Combine(VFS_PATH, gameFile.Path);

        if (File.Exists(writePath))
        {
          Console.WriteLine($"{gameFile.Path} already exists; skipping...");
          continue;
        }

        Console.WriteLine($"{gameFile.Path} writing from vfs...");

        string? directory = Path.GetDirectoryName(writePath);

        if (directory != null && !Directory.Exists(directory))
        {
          Directory.CreateDirectory(directory);
        }

        File.WriteAllBytes(writePath, gameFile.Read());
      }
    }

    private static string[] ExergizableFiles = ["Blitz/Config/DefaultDlc.ini"];

    private static bool ShouldExergize(string path)
    {
      return ExergizableFiles.Contains(path);
    }
  }
}
