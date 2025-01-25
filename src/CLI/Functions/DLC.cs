using CLI.Models;
using CLI.Utils;

namespace CLI.Functions
{
  class DLC
  {
    public static void Run(Arguments args)
    {
      BlitzVfs vfs = new();

      vfs.Initialize();

      // PakFileReader reader = new(
      //   "C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz Playtest/Blitz/Content/Paks/pakchunk0-Windows.pak"
      // );

      // reader.Mount();

      // foreach (var file in reader.Files)
      // {
      //   GameFile gameFile = file.Value;
      //   Console.WriteLine(gameFile);
      // }
    }
  }
}
