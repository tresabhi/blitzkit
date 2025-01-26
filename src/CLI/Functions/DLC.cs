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

      // DefaultFileProvider provider = new(
      //   directory: new(
      //     "C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz Playtest"
      //   ),
      //   extraDirectories: [new DirectoryInfo("C:/Users/coola/AppData/Local/Blitz")],
      //   searchOption: SearchOption.AllDirectories,
      //   isCaseInsensitive: false,
      //   versions: new(game: EGame.GAME_UE5_3, platform: ETexturePlatform.DesktopMobile, ver: new())
      // );

      // provider.Initialize();
    }
  }
}
