using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Assets.Exports;
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

          default:
          {
            throw new Exception($"Unhandled property type: {property}");
          }
        }
      }
    }

    public string GetName(string name)
    {
      return Names[name].Value.Text;
    }

    public bool GetBool(string name)
    {
      return Booleans[name].Value;
    }

    public bool? TryGetBool(string name)
    {
      return Booleans.TryGetValue(name, out var entry) ? entry.Value : null;
    }
  }
}
