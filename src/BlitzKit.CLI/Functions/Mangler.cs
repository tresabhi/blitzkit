using Blitzkit;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Utils;
using CUE4Parse.FileProvider.Objects;
using Google.Protobuf;
using Newtonsoft.Json.Linq;

namespace BlitzKit.CLI.Functions
{
  public static class Mangler
  {
    public static void Mangle()
    {
      Tanks tanks = new();
      BlitzProvider provider = new();

      foreach (var nation in provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories)
      {
        if (nation.Key == "TankStub")
          continue;

        foreach (var tank in nation.Value.Directories)
        {
          if (tank.Key != "R90_IS_4")
            continue;

          tanks.Tanks_.Add(tank.Key);
          var attributeFileName = $"DA_{tank.Key}_Attributes.uasset";
          var hasAttributesFile = tank.Value.HasFile(attributeFileName);
          GameFile? attributesFile = null;

          if (hasAttributesFile)
          {
            attributesFile = tank.Value.GetFile(attributeFileName);
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
                attributesFile = file.Value;
                break;
              }
            }

            if (attributesFile == null)
            {
              PrettyLog.Error(
                $"No suffixed attributes file found for {nation.Key}/{tank.Key}; skipping..."
              );
              continue;
            }
          }

          var exports = provider.LoadAllObjects(attributesFile.Path);

          var tankAttributesDataAsset =
            exports.First((export) => export.ExportType == "TankAttributesDataAsset")
            ?? throw new Exception("TankAttributesDataAsset not found");
          var attr = JObject.FromObject(tankAttributesDataAsset);

          Console.WriteLine(attr);
        }
      }

      var tanksBytes = tanks.ToByteArray();
    }
  }
}
