using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Assets.Exports;

namespace BlitzKit.CLI.Models
{
  public class Uasset
  {
    readonly GameFile file;
    readonly Dictionary<string, UObject> objects = [];

    public Uasset(GameFile file, AbstractFileProvider provider)
    {
      this.file = file;
      var objects = provider.LoadAllObjects(file.Path);

      foreach (var obj in objects)
      {
        this.objects.Add(obj.Name, obj);
      }
    }

    public UObject Get(string name) => objects[name];
  }
}
