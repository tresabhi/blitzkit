using CLI.Constants;
using CLI.Models;
using CUE4Parse.FileProvider;
using CUE4Parse.UE4.Pak;
using CUE4Parse.UE4.Readers;
using CUE4Parse.UE4.Versions;
using CUE4Parse.UE4.VirtualFileSystem;
using UE4Config.Parsing;

namespace CLI.Functions
{
  class DLC
  {
    public static void Run(Arguments args)
    {
      // string[] bundledContainers = Directory.GetFiles(Containers.BundledContainersDirectory);

      // foreach (string bundledContainer in bundledContainers)
      // {
      //   string fileName = Path.GetFileName(bundledContainer);

      //   Console.WriteLine($"Parsing bundled container \"{fileName}\"...");

      // }


      DefaultFileProvider provider = new(
        directory: ContainerConstants.DLCContainersDirectory,
        searchOption: SearchOption.TopDirectoryOnly,
        isCaseInsensitive: false,
        versions: new VersionContainer(BlitzConstants.EngineVersion)
      );

      provider.Initialize();
    }
  }
}
