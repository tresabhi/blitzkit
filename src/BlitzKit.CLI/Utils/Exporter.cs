using CUE4Parse_Conversion.Textures;
using CUE4Parse.UE4.Assets.Exports.Texture;

namespace BlitzKit.CLI.Utils
{
  public static class BlitzKitExporter
  {
    public static byte[] Texture2D(UTexture2D texture)
    {
      return texture
        .Decode(ETexturePlatform.DesktopMobile)!
        .Encode(ETextureFormat.Png, 100)
        .ToArray();
    }
  }
}
