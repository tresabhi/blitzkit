namespace CLI.Models
{
  public class PakFile
  {
    public long FileSize { get; set; }
    public required string FileHash { get; set; }
  }

  public class LocalManifest
  {
    public required Dictionary<string, PakFile> PakFiles { get; set; }
  }
}
