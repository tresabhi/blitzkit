using System.Collections;
using System.Collections.Frozen;
using System.Dynamic;
using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Objects;
using CUE4Parse.UE4.Assets.Objects.Properties;
using CUE4Parse.UE4.Objects.UObject;

namespace BlitzKit.CLI.Models
{
  public class MappedUObject : UObject
  {
    readonly Dictionary<string, NameProperty> Names = [];
    readonly Dictionary<string, SoftObjectProperty> SoftObjects = [];
    readonly Dictionary<string, ObjectProperty> Objects = [];
    readonly Dictionary<string, StructProperty> Structs = [];
    readonly Dictionary<string, BoolProperty> Booleans = [];
    readonly Dictionary<string, FloatProperty> Floats = [];
    readonly Dictionary<string, ArrayProperty> Arrays = [];
    readonly Dictionary<string, TextProperty> Texts = [];
    readonly Dictionary<string, IntProperty> Ints = [];
    readonly Dictionary<string, MapProperty> Maps = [];

    public MappedUObject(List<FPropertyTag> properties)
      : base(properties)
    {
      foreach (var property in properties)
      {
        switch (property.Tag)
        {
          case NameProperty name:
          {
            Names.Add(property.Name.Text, name);
            break;
          }

          case SoftObjectProperty softObject:
          {
            SoftObjects.Add(property.Name.Text, softObject);
            break;
          }

          case ObjectProperty obj:
          {
            Objects.Add(property.Name.Text, obj);
            break;
          }

          case StructProperty structure:
          {
            Structs.Add(property.Name.Text, structure);
            break;
          }

          case BoolProperty boolean:
          {
            Booleans.Add(property.Name.Text, boolean);
            break;
          }

          case FloatProperty number:
          {
            Floats.Add(property.Name.Text, number);
            break;
          }

          case ArrayProperty array:
          {
            Arrays.Add(property.Name.Text, array);
            break;
          }

          case TextProperty text:
          {
            Texts.Add(property.Name.Text, text);
            break;
          }

          case IntProperty integer:
          {
            Ints.Add(property.Name.Text, integer);
            break;
          }

          case MapProperty map:
          {
            Maps.Add(property.Name.Text, map);
            break;
          }

          default:
          {
            throw new Exception($"Unhandled property type: {property}");
          }
        }
      }
    }

    public FPropertyTag GetAny(string name) =>
      Properties.First(property => property.Name.Text == name);

    public string GetName(string name) => Names[name].Value.Text;

    public string? TryGetName(string name) =>
      Names.TryGetValue(name, out var entry) ? entry.Value.Text : null;

    public bool GetBool(string name) => Booleans[name].Value;

    public bool? TryGetBool(string name) =>
      Booleans.TryGetValue(name, out var entry) ? entry.Value : null;

    public T GetSoftObject<T>(string name)
      where T : UObject => SoftObjects[name].Value.Load<T>();

    public MappedUObject GetMappedSoftObject(string name) =>
      new(GetMappedSoftObject(name).Properties);

    public MappedUObject? TryGetSoftObject(string name) =>
      SoftObjects.TryGetValue(name, out var entry)
        ? new MappedUObject(entry.Value.Load().Properties)
        : null;

    public MappedUObject GetObject(string name) => new(Objects[name].Value!.Load()!.Properties);

    public MappedUDataTable GetObjectDataTable(string name) =>
      new(Objects[name].Value!.Load<UDataTable>()!);

    public MappedUObject GetStruct(string name) =>
      new(Structs[name].GetValue<FStructFallback>()!.Properties);

    public MappedUObject[] GetArray(string name)
    {
      return
      [
        .. Arrays[name]
          .Value!.Properties.Select(property => new MappedUObject(
            property.GetValue<FStructFallback>()!.Properties
          )),
      ];
    }
  }
}
