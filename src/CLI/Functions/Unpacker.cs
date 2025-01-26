namespace CLI.Functions
{
  class Unpacker
  {
    public static void Unpack(string[] args)
    {
      if (args.Length < 2)
      {
        throw new ArgumentException("Missing required working directory argument");
      }

      string workingDirectory = args[1];
      string paksDirectory = Path.Combine(workingDirectory, "Blitz/Content/Paks");
      string[] files = Directory.GetFiles(paksDirectory, "*.pak");

      foreach (string file in files)
      {
        Console.WriteLine($"Reading \"{file}\"");
      }

      // BlitzVfs vfs = new();

      // vfs.Initialize();

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
