using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Objects;

namespace BlitzKit.CLI.Models
{
  public class MappedUDataTable : MappedUObject
  {
    readonly Dictionary<string, FStructFallback> StructFallbacks = [];

    public MappedUDataTable(UDataTable table)
      : base(table.Properties)
    {
      foreach (var row in table.RowMap)
      {
        StructFallbacks.Add(row.Key.Text, row.Value);
      }
    }

    public MappedUObject GetRow(string name) => new(StructFallbacks[name].Properties);
  }
}
