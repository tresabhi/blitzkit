using System;
using System.IO;
using System.Text;
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

      Console.WriteLine(DiscoveryURL());
    }

    public string DiscoveryURL()
    {
      if (TryGetGameFile("Blitz/Config/DefaultEngine.ini", out var defaultEngine))
      {
        INIAccessor accessor = new(Encoding.UTF8.GetString(defaultEngine.Read()));

        var url = (string)accessor.Get("DiscoveryURLDedicProduction");

        return url;
      }
      else
      {
        throw new FileNotFoundException("Could not find DefaultEngine.ini");
      }
    }
  }
}
