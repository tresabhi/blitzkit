using CUE4Parse.Compression;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Pak;

namespace CLI.Functions
{
  class Unpacker
  {
    public static string ZlibPath = "../../temp/zlib.dll";
    public static string VFSWriteDirectory = "../../temp/vfs/";

    public static void Unpack(string[] args)
    {
      if (args.Length < 2)
      {
        throw new ArgumentException("Missing required initial paks directory");
      }

      if (File.Exists(ZlibPath))
      {
        Console.WriteLine($"Zlib found at {ZlibPath}; using that...");
      }
      else
      {
        Console.WriteLine($"Zlib not found; downloading to {ZlibPath}...");
        ZlibHelper.DownloadDll(ZlibPath);
      }

      ZlibHelper.Initialize(ZlibPath);

      string workingDirectory = args[1];
      string paksDirectory = Path.Combine(workingDirectory, "Blitz/Content/Paks");
      string[] containers = Directory.GetFiles(paksDirectory, "*.pak");

      foreach (string container in containers)
      {
        Exergy(container);
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

        string writePath = Path.Combine(VFSWriteDirectory, gameFile.Path);

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
