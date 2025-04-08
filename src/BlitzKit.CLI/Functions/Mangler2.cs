using BlitzKit.CLI.Models;
using UAssetAPI;
using UAssetAPI.ExportTypes;
using UAssetAPI.PropertyTypes.Objects;
using UAssetAPI.UnrealTypes;
using UAssetAPI.Unversioned;

namespace BlitzKit.CLI.Functions
{
  public partial class Mangler2(string[] args)
  {
    readonly BlitzProvider2 provider = new();

    public void Mangle()
    {
      var assetPath = "Blitz/Content/Tanks/USSR/R45_IS_7/PDA_R45_IS_7";

      Console.WriteLine(provider.Asset(assetPath));
    }
  }
}
