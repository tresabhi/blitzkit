using BlitzKit.CLI.Models;
using BlitzKit.CLI.Utils;
using CUE4Parse.FileProvider.Objects;

namespace BlitzKit.CLI.Functions
{
  public static class Mangler
  {
    public static void Mangle()
    {
      BlitzProvider provider = new();

      foreach (var nation in provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories)
      {
        if (nation.Key == "TankStub")
          continue;

        foreach (var tank in nation.Value.Directories)
        {
          if (tank.Key != "R90_IS_4")
            continue;

          var attributeFileName = $"DA_{tank.Key}_Attributes.uasset";
          var hasAttributesFile = tank.Value.HasFile(attributeFileName);
          GameFile? attributes = null;

          if (hasAttributesFile)
          {
            attributes = tank.Value.GetFile(attributeFileName);
          }
          else
          {
            PrettyLog.Warn(
              $"No attributes file found for {nation.Key}/{tank.Key}, it may be misspelled; finding any attributes file..."
            );

            foreach (var file in tank.Value.Files)
            {
              if (file.Key.EndsWith("_Attributes.uasset"))
              {
                attributes = file.Value;
                break;
              }
            }

            if (attributes == null)
            {
              PrettyLog.Error(
                $"No suffixed attributes file found for {nation.Key}/{tank.Key}; skipping..."
              );
              continue;
            }
          }

          var objects = provider.LoadAllObjects(attributes.Path);
          var objectsCount = objects.Count();

          if (objectsCount != 1)
          {
            throw new Exception($"Expected 1 object for attribute objects, got {objectsCount}");
          }

          foreach (var obj in objects)
          {
            Console.WriteLine(obj.Properties);
          }
        }
      }
    }
  }
}
