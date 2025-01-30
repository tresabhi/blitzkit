using Blitzkit;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Utils;
using CUE4Parse.FileProvider.Objects;
using Google.Protobuf;
using Google.Protobuf.Collections;
using Newtonsoft.Json.Linq;

namespace BlitzKit.CLI.Functions
{
  public static class Mangler
  {
    public static void Mangle()
    {
      Tanks tanks = new();
      BlitzProvider provider = new();

      foreach (
        var nationDir in provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories
      )
      {
        if (nationDir.Key == "TankStub")
          continue;

        foreach (var tankDir in nationDir.Value.Directories)
        {
          if (tankDir.Key != "R90_IS_4")
            continue;

          var attributeFileName = $"DA_{tankDir.Key}_Attributes.uasset";
          var hasAttributesFile = tankDir.Value.HasFile(attributeFileName);
          GameFile? attributesFile = null;

          if (hasAttributesFile)
          {
            attributesFile = tankDir.Value.GetFile(attributeFileName);
          }
          else
          {
            PrettyLog.Warn(
              $"No attributes file found for {nationDir.Key}/{tankDir.Key}, it may be misspelled; finding any attributes file..."
            );

            foreach (var file in tankDir.Value.Files)
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
                $"No suffixed attributes file found for {nationDir.Key}/{tankDir.Key}; skipping..."
              );
              continue;
            }
          }

          var exports = provider.LoadAllObjects(attributesFile.Path);

          var tankAttributesDataAsset =
            exports.First((export) => export.ExportType == "TankAttributesDataAsset")
            ?? throw new Exception("TankAttributesDataAsset not found");
          var attr = JObject.FromObject(tankAttributesDataAsset);
          var props = attr.GetValue("Properties");

          if (props == null || props["MaxHealth"] == null)
          {
            PrettyLog.Warn(
              $"{nationDir.Key}/{tankDir.Key} has not migrated to Reforged; skipping..."
            );
            continue;
          }

          Tank tank = new()
          {
            Id = tankDir.Key,
            // TODO: Name
            // TODO: Set
            // TODO: Class
            // TODO: Faction

            TurretRotatorHealth = MangleModuleHealth((props["TurretRotatorHealth"] as JObject)!),
            SurveyingDeviceHealth = MangleModuleHealth(
              (props["SurveyingDeviceHealth"] as JObject)!
            ),
            GunHealth = MangleModuleHealth((props["GunHealth"] as JObject)!),
            ChassisHealth = MangleModuleHealth((props["ChassisHealth"] as JObject)!),
            AmmoBayHealth = MangleModuleHealth((props["AmmoBayHealth"] as JObject)!),
            EngineHealth = MangleModuleHealth((props["EngineHealth"] as JObject)!),
            FuelTankHealth = MangleModuleHealth((props["FuelTankHealth"] as JObject)!),
          };

          MangleCrewHealth(tank.CrewHealth, (props["CrewHealth"] as JArray)!);

          tanks.Tanks_.Add(tank.Id);

          var tankBytes = tank.ToByteArray();

          Console.WriteLine($"Mangled {nationDir.Key}/{tankDir.Key}");
        }
      }

      var tanksBytes = tanks.ToByteArray();
    }

    public static Dictionary<string, CrewType> CrewTypes = new()
    {
      { "EModuleOrTankmen::Commander", CrewType.Commander },
      { "EModuleOrTankmen::Driver", CrewType.Driver },
      { "EModuleOrTankmen::Gunner1", CrewType.Gunner1 },
      { "EModuleOrTankmen::Gunner2", CrewType.Gunner2 },
      { "EModuleOrTankmen::Loader1", CrewType.Loader1 },
      { "EModuleOrTankmen::Loader2", CrewType.Loader2 },
    };

    public static void MangleCrewHealth(RepeatedField<CrewHealth> map, JArray array)
    {
      foreach (var member in array.Cast<JObject>())
      {
        var key = member["Key"]!.Value<string>()!;

        if (CrewTypes.TryGetValue(key, out var crewType))
        {
          CrewHealth crewHealth = new()
          {
            Type = crewType,
            MaxHealth = member["Value"]!["MaxHealth"]!.Value<float>(),
          };
          map.Add(crewHealth);
        }
        else
        {
          throw new Exception($"Unrecognized CrewType: {key}");
        }
      }
    }

    public static ModuleHealth MangleModuleHealth(JObject obj)
    {
      ModuleHealth moduleHealth = new()
      {
        MaxHealth = obj["MaxHealth"]!.Value<float>(),
        MaxRegenHealth = obj["MaxRegenHealth"]!.Value<float>(),
        HealthRegenPerSec = obj["HealthRegenPerSec"]!.Value<float>(),
      };

      if (obj.TryGetValue("HysteresisHealth", out var hysteresis))
      {
        moduleHealth.HysteresisHealth = hysteresis.Value<float>();
      }

      if (obj.TryGetValue("HealthBurnPerSec", out var burn))
      {
        moduleHealth.HealthBurnPerSec = burn.Value<float>();
      }

      return moduleHealth;
    }
  }
}
