using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;

namespace CLI.Functions
{
  public static class AssetsBuilder
  {
    private static readonly string LOCAL_USER = "coola";
    private static readonly string LOCAL_DLC_CONTAINERS_PATH =
      $"C:/Users/{LOCAL_USER}/AppData/Local/Blitz/Saved/PersistentDownloadDir/Dlc/PakCache";
    private static readonly string LOCAL_BUNDLED_CONTAINERS_PATH =
      "C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz Playtest/Blitz/Content/Paks";

    public static void Build(string[] args)
    {
      DefaultFileProvider provider = new(
        directory: new DirectoryInfo(LOCAL_DLC_CONTAINERS_PATH),
        extraDirectories: [new(LOCAL_BUNDLED_CONTAINERS_PATH)],
        searchOption: SearchOption.TopDirectoryOnly
      );

      provider.Initialize();
      provider.Mount();

      foreach (var file in provider.Files)
      {
        GameFile gameFile = file.Value;
        Console.WriteLine(gameFile.Path);
      }
    }
  }
}
