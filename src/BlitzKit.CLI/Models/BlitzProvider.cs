using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.MappingsProvider;
using CUE4Parse.UE4.Versions;

namespace BlitzKit.CLI.Models
{
  public class BlitzProvider : DefaultFileProvider
  {
    private static readonly string LOCAL_DLC_CONTAINERS_PATH =
      $"C:/Users/coola/AppData/Local/Blitz/Saved/PersistentDownloadDir/Dlc/PakCache";
    private static readonly string LOCAL_BUNDLED_CONTAINERS_PATH =
      "C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz Playtest/Blitz/Content/Paks";
    private static readonly string DEPOT_CONTAINERS_PATH = "../../temp/containers";
    private static readonly string MAPPINGS_PATH = "../../submodules/blitzkit-closed/blitz.usmap";

    public readonly VFS RootDirectory;

    public BlitzProvider(bool depot)
      : base(
        directory: new DirectoryInfo(depot ? DEPOT_CONTAINERS_PATH : LOCAL_BUNDLED_CONTAINERS_PATH),
        extraDirectories: depot ? [] : [new(LOCAL_DLC_CONTAINERS_PATH)],
        searchOption: SearchOption.TopDirectoryOnly,
        versions: new(EGame.GAME_UE5_3),
        pathComparer: StringComparer.OrdinalIgnoreCase
      )
    {
      RootDirectory = new()
      {
        ParentPath = "",
        Path = "",
        Name = "",
        provider = this,
      };
      MappingsContainer = new FileUsmapTypeMappingsProvider(MAPPINGS_PATH);

      Initialize();
      Mount();

      foreach (var file in Files)
      {
        var gameFile = file.Value;
        var path = gameFile.Path.Split('/');
        var lastPathSegment = path.Last();
        var directory = RootDirectory;
        var parentPath = "";

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
            VFS newDirectory = new()
            {
              ParentPath = parentPath,
              Path = parentPath == "" ? "" : $"{parentPath}{segment}",
              Name = segment,
              provider = this,
            };
            directory.AddDirectory(segment, newDirectory);
            directory = newDirectory;
          }

          parentPath += $"{segment}/";
        }
      }
    }
  }
}
