using System.Text.Json;
using CLI.Models;

namespace CLI
{
  class Program
  {
    static readonly JsonSerializerOptions options = new() { PropertyNameCaseInsensitive = true };

    static void Main(string[] args)
    {
      string RootDir = @"C:\Users\coola\AppData\Local\Blitz";
      string paksPath = Path.Combine(RootDir, @"Saved\PersistentDownloadDir\Dlc\PakCache");
      string localManifestPath = Path.Combine(paksPath, "LocalManifest.json");
      string localManifestContent = File.ReadAllText(localManifestPath);

      LocalManifest localManifest =
        JsonSerializer.Deserialize<LocalManifest>(localManifestContent, options)
        ?? throw new Exception("Failed to deserialize LocalManifest");

      foreach (var pakFile in localManifest.PakFiles)
      {
        string pakFilePath = Path.Combine(paksPath, pakFile.Key);
        Console.WriteLine($"({pakFile.Value.FileSize}) {pakFilePath}");
      }
    }
  }
}
