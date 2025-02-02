using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;

namespace BlitzKit.CLI.Models
{
  public class VfsDirectory
  {
    public Dictionary<string, VfsDirectory> Directories = [];
    public Dictionary<string, GameFile> Files = [];
    public required string Name;
    public required AbstractFileProvider provider;

    public void AddFile(string name, GameFile file) => Files.TryAdd(name, file);

    public bool HasFile(string name) => Files.ContainsKey(name);

    public Uasset GetUasset(string name) => new(GetFile(name), provider);

    public GameFile GetFile(string name)
    {
      var directoryPath = Path.GetDirectoryName(name);
      var fileName = Path.GetFileName(name);
      var directory =
        directoryPath == null || directoryPath.Length == 0 ? this : GetDirectory(directoryPath);

      return directory.Files[fileName];
    }

    public bool HasDirectory(string name) => Directories.ContainsKey(name);

    public VfsDirectory GetDirectory(string name)
    {
      var segments = name.Split('/');
      var directory = this;

      foreach (var segment in segments)
      {
        directory = directory.Directories[segment];
      }

      return directory;
    }

    public void AddDirectory(string name, VfsDirectory directory) =>
      Directories.Add(name, directory);
  }
}
