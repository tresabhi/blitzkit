using CLI.Models;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Pak;

namespace CLI.Functions
{
  class DLC
  {
    public static void Run(Arguments args)
    {
      // DefaultFileProvider provider = new(
      //   directory: new(BlitzConstants.AppDataDirectory),
      //   searchOption: SearchOption.AllDirectories,
      //   isCaseInsensitive: false,
      //   extraDirectories: [new(BlitzConstants.InstallationDirectory)]
      // );

      // provider.Initialize();

      // Console.WriteLine("Mounted containers: " + provider.MountedVfs.Count);

      // foreach (var file in provider.Files)
      // {
      //   GameFile gameFile = file.Value;
      //   Console.WriteLine(gameFile.Name);
      // }

      PakFileReader reader = new(
        "C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz Playtest/Blitz/Content/Paks/pakchunk0-Windows.pak"
      );

      reader.Mount();

      foreach (var file in reader.Files)
      {
        GameFile gameFile = file.Value;
        // Console.WriteLine(gameFile);
      }
    }
  }
}
