using CLI.Utils;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Pak;

namespace CLI.Functions
{
  class Unpacker
  {
    public static string ZlibPath = "../../temp/zlib.dll";
    public static string VFSWriteDir = "../../temp/vfs/";

    // this may be different from the one provided in args so check this and not args[1]
    // we don't wanna delete my local installation of the game when debugging haha!
    public static string tempDepotsDir = "../../temp/depot/";

    public static void Unpack(string[] args)
    {
      if (args.Length < 2)
      {
        throw new ArgumentException("Missing required initial paks directory");
      }

      AgnosticZlibHelper.Initialize();

      string workingDirectory = args[1];
      string paksDirectory = Path.Combine(workingDirectory, "Blitz/Content/Paks");
      string[] containers = Directory.GetFiles(paksDirectory, "*.pak");

      foreach (string container in containers)
      {
        Exergy(container);
      }

      if (Directory.Exists(tempDepotsDir))
      {
        Console.WriteLine("Deleting temp depots directory...");
        Directory.Delete(tempDepotsDir, true);
      }
    }

    public static void Exergy(string container)
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

        string writePath = Path.Combine(VFSWriteDir, gameFile.Path);

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

    public static string[] ExergizableFiles = ["Blitz/Config/DefaultDlc.ini"];

    public static bool ShouldExergize(string path)
    {
      return ExergizableFiles.Contains(path);
    }
  }
}
