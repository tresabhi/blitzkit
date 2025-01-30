using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.MappingsProvider;
using CUE4Parse.UE4.Versions;

namespace BlitzKit.CLI.Models
{
  public class BlitzProvider : DefaultFileProvider
  {
    private static readonly string LOCAL_USER = "coola";
    private static readonly string LOCAL_DLC_CONTAINERS_PATH =
      $"C:/Users/{LOCAL_USER}/AppData/Local/Blitz/Saved/PersistentDownloadDir/Dlc/PakCache";
    private static readonly string LOCAL_BUNDLED_CONTAINERS_PATH =
      "C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz Playtest/Blitz/Content/Paks";
    private static readonly string LOCAL_MAPPINGS_PATH =
      "../../submodules/blitzkit-closed/blitz.usmap";

    public readonly VfsDirectory RootDirectory = new();

    public BlitzProvider()
      : base(
        directory: new DirectoryInfo(LOCAL_BUNDLED_CONTAINERS_PATH),
        extraDirectories: [new(LOCAL_DLC_CONTAINERS_PATH)],
        searchOption: SearchOption.TopDirectoryOnly,
        versions: new(EGame.GAME_UE5_3)
      )
    {
      MappingsContainer = new FileUsmapTypeMappingsProvider(LOCAL_MAPPINGS_PATH);

      Initialize();
      Mount();

      foreach (var file in Files)
      {
        var gameFile = file.Value;
        var path = gameFile.Path.Split('/');
        var lastPathSegment = path.Last();
        var directory = RootDirectory;

        foreach (var segment in path)
        {
          bool isLastSegment = lastPathSegment == segment;

          if (isLastSegment)
          {
            directory.AddFile(segment, gameFile);
          }
          else if (directory.HasDirectory(segment))
          {
            directory = directory.GetDirectory(segment);
          }
          else
          {
            VfsDirectory newDirectory = new();
            directory.AddDirectory(segment, newDirectory);
            directory = newDirectory;
          }
        }
      }
    }
  }

  public class VfsDirectory
  {
    public Dictionary<string, VfsDirectory> Directories = [];
    public Dictionary<string, GameFile> Files = [];

    public void AddFile(string name, GameFile file) => Files.TryAdd(name, file);

    public bool HasFile(string name) => Files.ContainsKey(name);

    public GameFile GetFile(string name)
    {
      var directoryPath = Path.GetDirectoryName(name);
      var fileName = Path.GetFileName(name);
      var directory =
        directoryPath == null || directoryPath.Length == 0 ? this : GetDirectory(directoryPath);

      return directory.Files[fileName];
    }

    public bool HasDirectory(string name) => Directories.ContainsKey(name);

    public VfsDirectory GetDirectory(string name)
    {
      var segments = name.Split('/');
      var directory = this;

      foreach (var segment in segments)
      {
        directory = directory.Directories[segment];
      }

      return directory;
    }

    public void AddDirectory(string name, VfsDirectory directory) =>
      Directories.Add(name, directory);
  }
}
