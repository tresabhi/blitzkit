using System;
using System.IO;
using BlitzKit.FFI.Utils;
using CUE4Parse.FileProvider;
using CUE4Parse.UE4.Versions;

namespace BlitzKit.FFI.Models
{
  public class BlitzProvider : DefaultFileProvider
  {
    public BlitzProvider(string directory)
      : base(
        directory: directory,
        searchOption: SearchOption.AllDirectories,
        versions: new(EGame.GAME_UE5_3),
        pathComparer: StringComparer.OrdinalIgnoreCase
      )
    {
      Initialize();
      Mount();
    }

    public INIAccessor GetDefaultEngine() => new(this["Blitz/Config/DefaultEngine.ini"]);

    public string GetBindingsURLProduction() =>
      GetDefaultEngine()["/Script/MintSDK.MintSDKSettingsObject"]["DiscoveryBindingsURLProduction"];

    public string GetBindingsURLDev() =>
      GetDefaultEngine()["/Script/MintSDK.MintSDKSettingsObject"]["DiscoveryBindingsURLDev"];
  }
}
