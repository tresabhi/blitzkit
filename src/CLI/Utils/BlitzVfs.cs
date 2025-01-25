using CUE4Parse.Compression;
using CUE4Parse.FileProvider.Vfs;
using CUE4Parse.UE4.Pak;
using CUE4Parse.UE4.Versions;

namespace CLI.Utils
{
  public class BlitzVfs : AbstractVfsFileProvider
  {
    public const EGame EngineVersion = EGame.GAME_UE5_3;
    public const string InstallationDirectory =
      "C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz Playtest";
    public const string AppDataDirectory = "C:/Users/coola/AppData/Local/Blitz";

    private static string[] IndexDirectories()
    {
      return
      [
        Path.Combine(InstallationDirectory, "Blitz/Content/Paks"),
        Path.Combine(AppDataDirectory, "Saved/PersistentDownloadDir/Dlc/PakCache"),
      ];
    }

    private static List<string> IndexContainers()
    {
      string[] directories = IndexDirectories();
      List<string> files = [];

      foreach (string directory in directories)
      {
        if (!Directory.Exists(directory))
        {
          throw new Exception($"Directory \"{directory}\" does not exist");
        }

        string[] directoryFiles = Directory.GetFiles(directory, "*.pak");
        files.AddRange(directoryFiles);
      }

      return files;
    }

    public override void Initialize()
    {
      ZlibHelper.DownloadDll("temp/zlib.dll");
      ZlibHelper.Initialize("temp/zlib.dll");

      List<string> containers = IndexContainers();

      foreach (string container in containers)
      {
        PakFileReader reader = new(container);

        reader.Mount();

        foreach (var gameFile in reader.Files)
        {
          Console.WriteLine($"Reading \"{gameFile.Key}\"");

          byte[] bytes = gameFile.Value.Read();
          string path = $"temp/container/{gameFile.Key}";
          string? directory = Path.GetDirectoryName(path);

          if (directory != null && !Directory.Exists(directory))
          {
            Directory.CreateDirectory(directory);
          }

          File.WriteAllBytes(path, bytes);
        }

        break;
      }
    }
  }
}
