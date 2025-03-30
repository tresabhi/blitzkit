using Blitzkit;
using CUE4Parse_Conversion.Textures;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Assets.Objects;
using CUE4Parse.UE4.Objects.Core.Math;

namespace BlitzKit.CLI.Utils
{
  public static class BlitzKitExporter
  {
    private static readonly float SCALE = 0.01f;

    public static byte[] Texture2D(UTexture2D texture)
    {
      return texture
        .Decode(ETexturePlatform.DesktopMobile)!
        .Encode(ETextureFormat.Png, 100)
        .ToArray();
    }

    public static Vector3 Vector3(FVector fVector)
    {
      return new()
      {
        X = SCALE * fVector.X,
        Y = SCALE * fVector.Z,
        Z = SCALE * fVector.Y,
      };
    }
  }
}
