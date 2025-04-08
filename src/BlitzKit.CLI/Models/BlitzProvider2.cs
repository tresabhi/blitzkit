using System.Text.Json;
using Org.BouncyCastle.Tls.Crypto.Impl.BC;
using UAssetAPI;
using UAssetAPI.UnrealTypes;
using UAssetAPI.Unversioned;

namespace BlitzKit.CLI.Models
{
  public class BlitzProvider2 : IDisposable
  {
    readonly EngineVersion Version = EngineVersion.VER_UE5_3;

    readonly string BUNDLED_CONTAINERS_DIR = Path.Combine(
      Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
      "Steam",
      "steamapps",
      "common",
      "World of Tanks Blitz Playtest",
      "Blitz",
      "Content",
      "Paks"
    );
    readonly string DLC_CONTAINERS_DIR = Path.Combine(
      Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
      "Blitz",
      "Saved",
      "PersistentDownloadDir",
      "Dlc",
      "PakCache"
    );
    readonly Usmap Map = new("../../submodules/blitzkit-closed/blitz.usmap");

    readonly Dictionary<string, (PakReader Reader, Stream Stream)> FileMap = [];
    readonly List<PakReader> Readers = [];

    public BlitzProvider2()
    {
      var containers = new List<string>(
        Directory.GetFiles(BUNDLED_CONTAINERS_DIR, "*.pak", SearchOption.TopDirectoryOnly)
      );

      var localManifest =
        JsonSerializer.Deserialize<LocalManifest>(
          File.ReadAllText(Path.Combine(DLC_CONTAINERS_DIR, "LocalManifest.json"))
        ) ?? throw new Exception("Failed to deserialize LocalManifest.json");

      containers.AddRange(
        localManifest.PakFiles.Keys.Select(file => Path.Combine(DLC_CONTAINERS_DIR, file))
      );

      foreach (string container in containers)
      {
        using var stream = File.OpenRead(container);
        var reader =
          new PakBuilder().Reader(stream) ?? throw new Exception("Failed to create PakReader");

        Readers.Add(reader);

        foreach (var file in reader.Files())
        {
          FileMap[file] = (reader, stream);
        }
      }
    }

    public UAsset Asset(string path)
    {
      var assetPath = $"{path}.uasset";
      var expPath = $"{path}.uexp";

      var (reader, stream) = FileMap[assetPath];

      byte[] assetBytes = reader.Get(stream, assetPath);
      byte[] uexpBytes = reader.Get(stream, expPath);

      MemoryStream assetStream = new([.. assetBytes, .. uexpBytes]);
      AssetBinaryReader assetReader = new(assetStream);

      return new(assetReader, Version, Map);
    }

    public void Dispose()
    {
      foreach (var reader in Readers)
      {
        reader.Dispose();
      }

      GC.SuppressFinalize(this);
    }
  }
}
