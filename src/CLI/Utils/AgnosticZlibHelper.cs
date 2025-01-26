using System.Runtime.InteropServices;
using CUE4Parse.Compression;

namespace CLI.Utils
{
  public static class AgnosticZlibHelper
  {
    public const string ZlibRootPath = "../../temp/";
    public const string ZlibBinariesPrefix =
      "https://github.com/NotOfficer/Zlib-ng.NET/releases/download/1.0.0";

    public static void Initialize()
    {
      string binariesUrl;
      string fileExtension;

      if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
      {
        binariesUrl = $"{ZlibBinariesPrefix}/zlib-ng2.dll";
        fileExtension = "dll";
      }
      else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
      {
        binariesUrl = $"{ZlibBinariesPrefix}/libz-ng.so";
        fileExtension = "so";
      }
      else
      {
        throw new PlatformNotSupportedException();
      }

      string fileName = $"zlib.{fileExtension}";
      string filePath = Path.Combine(ZlibRootPath, fileName);

      if (File.Exists(filePath))
      {
        Console.WriteLine($"Zlib found at {filePath}; using that...");
      }
      else
      {
        Console.WriteLine($"Zlib not found; downloading to {filePath} from {binariesUrl}...");
        ZlibHelper.DownloadDll(filePath, binariesUrl);
      }

      ZlibHelper.Initialize(filePath);
    }
  }
}
