using System;
using System.IO;
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
  }
}
