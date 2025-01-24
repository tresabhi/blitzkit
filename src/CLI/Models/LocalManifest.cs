namespace CLI.Models
{
  public class LocalManifestPakFile
  {
    public long FileSize { get; set; }
    public required string FileHash { get; set; }
  }

  public class LocalManifest
  {
    public required Dictionary<string, LocalManifestPakFile> PakFiles { get; set; }
  }
}
