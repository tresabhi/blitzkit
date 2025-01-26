using System.Text.Json.Serialization;

namespace CLI.Models
{
  public partial class DlcManifest
  {
    [JsonPropertyName("contentBuildId")]
    public string ContentBuildId { get; set; }

    [JsonPropertyName("pakFiles")]
    public List<PakFile> PakFiles { get; set; }

    [JsonPropertyName("chunkTags")]
    public Dictionary<string, ChunkTag> ChunkTags { get; set; }

    [JsonPropertyName("chunkDependencies")]
    public List<ChunkDependency> ChunkDependencies { get; set; }
  }

  public partial class ChunkDependency
  {
    [JsonPropertyName("chunkId")]
    public long ChunkId { get; set; }

    [JsonPropertyName("parentChunkId")]
    public long ParentChunkId { get; set; }
  }

  public partial class ChunkTag
  {
    [JsonPropertyName("gameplayTags")]
    public List<GameplayTag> GameplayTags { get; set; }
  }

  public partial class GameplayTag
  {
    [JsonPropertyName("tagName")]
    public string TagName { get; set; }
  }

  public partial class PakFile
  {
    [JsonPropertyName("fileName")]
    public string FileName { get; set; }

    [JsonPropertyName("fileSize")]
    public long FileSize { get; set; }

    [JsonPropertyName("fileVersion")]
    public string FileVersion { get; set; }

    [JsonPropertyName("chunkId")]
    public long ChunkId { get; set; }

    [JsonPropertyName("relativeUrl")]
    public string RelativeUrl { get; set; }

    [JsonPropertyName("availabilityMask")]
    public long AvailabilityMask { get; set; }
  }
}
