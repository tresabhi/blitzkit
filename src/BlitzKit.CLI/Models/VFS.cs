using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Objects;
using CUE4Parse.UE4.Assets.Objects.Properties;

namespace BlitzKit.CLI.Models
{
  public class VFS
  {
    public Dictionary<string, VFS> Directories = [];
    public Dictionary<string, GameFile> Files = [];

    public required string ParentPath;
    public required string Path;
    public required string Name;

    public required AbstractFileProvider provider;

    public void AddFile(string name, GameFile file) => Files.TryAdd(name, file);

    public bool HasFile(string name) => Files.ContainsKey(name);

    public GameFile GetFile(string name)
    {
      var directoryPath = System.IO.Path.GetDirectoryName(name);
      var fileName = System.IO.Path.GetFileName(name);
      var directory =
        directoryPath == null || directoryPath.Length == 0 ? this : GetDirectory(directoryPath);

      return directory.Files[fileName];
    }

    public bool HasDirectory(string name) => Directories.ContainsKey(name);

    public VFS GetDirectory(string name)
    {
      var segments = name.Split('/');
      var directory = this;

      foreach (var segment in segments)
      {
        directory = directory.Directories[segment];
      }

      return directory;
    }

    public void AddDirectory(string name, VFS directory) => Directories.Add(name, directory);
  }
}
