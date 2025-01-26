using CLI.Utils;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Pak;

namespace CLI.Functions
{
  class Unpacker
  {
    private const string contentGroup = "p14y73c7_p5e_b10gg3RS_big_play";
    private const string vfs = "../../temp/vfs/";

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

      UnpackDepot(args[1]);
      UnpackDLC();
    }

    private static void UnpackDLC()
    {
      string defaultDlcPath = Path.Combine(vfs, "Blitz/Config/DefaultDlc.ini");
      IniParser iniParser = new(defaultDlcPath);
      string? contentBuildId = iniParser.GetString("DefaultContentBuildId");

      if (string.IsNullOrEmpty(contentBuildId))
      {
        throw new Exception("Failed to read content build id from DefaultDlc.ini");
      }

      Console.WriteLine($"Exploring DLC {contentBuildId} within group {contentGroup}");
    }

    private static void UnpackDepot(string workingDirectory)
    {
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

        string writePath = Path.Combine(vfs, gameFile.Path);

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
