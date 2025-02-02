using Blitzkit;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Utils;
using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Exports.StaticMesh;
using CUE4Parse.UE4.Objects.UObject;
using CUE4Parse.Utils;
using Google.Protobuf.Collections;
using Newtonsoft.Json.Linq;

namespace BlitzKit.CLI.Functions
{
  public class Mangler
  {
    readonly Tanks tanks = new();
    readonly BlitzProvider provider = new();

    public void Mangle()
    {
      var nationDirs = provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories;

      foreach (var nationDir in nationDirs)
      {
        if (nationDir.Key == "TankStub")
          continue;

        MangleNation(nationDir.Value);
      }
    }

    void MangleNation(VfsDirectory nation)
    {
      foreach (var tankDir in nation.Directories)
      {
        if (tankDir.Value.Name != "R90_IS_4")
          continue;

        var tank = MangleTank(tankDir.Value);

        if (tank == null)
          continue;

        tanks.Tanks_.Add(tank.Id);
      }
    }

    Tank? MangleTank(VfsDirectory tankDir)
    {
      var pdaName = $"PDA_{tankDir.Name}";
      var pda = tankDir.GetUasset($"{pdaName}.uasset").Get(pdaName);
      var tankId = pda.GetName("TankId");
      var isDev = pda.TryGetBool("bInDevelopment") ?? true;

      if (isDev)
      {
        PrettyLog.Warn($"Skipping dev tank: {tankId}");
        return null;
      }
      else
      {
        PrettyLog.Success($"Mangling tank:     {tankId}");
      }

      var hulls = pda.GetObjectDataTable("DT_Hulls");
      var hull = hulls.GetRow("hull");
      var hullVisual = hull.GetObject("VisualData");
      var hullMeshSettings = hullVisual.GetStruct("MeshSettings");
      var hullMesh = hullMeshSettings.GetSoftObject<UStaticMesh>("Mesh");

      // var hullMesh = hullMeshSettings.GetSoftObject("Mesh");
      // GLB hullGlb = new(hullMesh);

      return new() { Id = tankId };
    }

    Dictionary<string, CrewType> CrewTypes = new()
    {
      { "EModuleOrTankmen::Commander", CrewType.Commander },
      { "EModuleOrTankmen::Driver", CrewType.Driver },
      { "EModuleOrTankmen::Gunner1", CrewType.Gunner1 },
      { "EModuleOrTankmen::Gunner2", CrewType.Gunner2 },
      { "EModuleOrTankmen::Loader1", CrewType.Loader1 },
      { "EModuleOrTankmen::Loader2", CrewType.Loader2 },
    };

    void MangleCrewHealth(RepeatedField<CrewHealth> map, JArray array)
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

    ModuleHealth MangleModuleHealth(JObject obj)
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
