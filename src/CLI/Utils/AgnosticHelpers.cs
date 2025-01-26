using System.IO.Compression;
using System.Runtime.InteropServices;
using CUE4Parse.Compression;

namespace CLI.Utils
{
  public static class AgnosticHelpers
  {
    public const string BINARY_DIR = "../../temp/";
    public const string ZLIB_BINARY_URL_PREFIX =
      "https://github.com/NotOfficer/Zlib-ng.NET/releases/download/1.0.0";
    public const string OODLE_BINARY_URL_PREFIX =
      "https://github.com/WorkingRobot/OodleUE/releases/download/2024-11-01-726";

    public static void Initialize()
    {
      InitializeZlib();
      InitializeOodle();
    }

    public static async Task InitializeOodle()
    {
      string url;
      string extension;
      string entry;

      if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
      {
        url = $"{OODLE_BINARY_URL_PREFIX}/msvc.zip";
        entry = "bin/Release/oodle-data-shared.dll";
        extension = "dll";
      }
      else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
      {
        url = $"{ZLIB_BINARY_URL_PREFIX}/gcc.zip";
        entry = "lib/Release/liboodle-data-shared.so";
        extension = "so";
      }
      else
      {
        throw new PlatformNotSupportedException();
      }

      HttpClient client = new();
      using var response = await client.GetAsync(url).ConfigureAwait(false);

      response.EnsureSuccessStatusCode();

      await using var responseStream = await response
        .Content.ReadAsStreamAsync()
        .ConfigureAwait(false);
      using var zip = new ZipArchive(responseStream, ZipArchiveMode.Read);
      var zipEntry = zip.GetEntry(entry);

      ArgumentNullException.ThrowIfNull(zipEntry, "oodle entry in zip not found");

      string path = Path.Combine(BINARY_DIR, $"oodle.{extension}");
      await using var entryStream = zipEntry.Open();
      await using var fs = File.Create(path);
      await entryStream.CopyToAsync(fs).ConfigureAwait(false);

      OodleHelper.Initialize(path);
    }

    public static void InitializeZlib()
    {
      string url;
      string extension;

      if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
      {
        url = $"{ZLIB_BINARY_URL_PREFIX}/zlib-ng2.dll";
        extension = "dll";
      }
      else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
      {
        url = $"{ZLIB_BINARY_URL_PREFIX}/libz-ng.so";
        extension = "so";
      }
      else
      {
        throw new PlatformNotSupportedException();
      }

      string fileName = $"zlib.{extension}";
      string filePath = Path.Combine(BINARY_DIR, fileName);

      if (File.Exists(filePath))
      {
        Console.WriteLine($"Zlib found at {filePath}; using that...");
      }
      else
      {
        Console.WriteLine($"Zlib not found; downloading to {filePath} from {url}...");
        ZlibHelper.DownloadDll(filePath, url);
      }

      ZlibHelper.Initialize(filePath);
    }
  }
}
