using System.Data;
using System.Text;
using System.Text.RegularExpressions;
using System.Text.Unicode;
using Blitzkit;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Utils;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Exports.StaticMesh;
using CUE4Parse.UE4.Assets.Objects;
using CUE4Parse.UE4.Objects.UObject;
using CUE4Parse.UE4.Pak.Objects;
using Google.Protobuf;
using Google.Protobuf.Collections;
using Newtonsoft.Json.Linq;

namespace BlitzKit.CLI.Functions
{
  public class Mangler(string[] args)
  {
    readonly BlitzProvider provider = new(args.Contains("--depot"));
    readonly List<FileChange> changes = [];

    public async Task Mangle()
    {
      var nationDirs = provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories;

      foreach (var nationDir in nationDirs)
      {
        if (nationDir.Key == "TankStub")
          continue;

        MangleNation(nationDir.Value);
      }

      await BlitzKitAssets.CommitAssets("ue assets", changes);
    }

    void MangleNation(VFS nation)
    {
      Tanks tanks = new();

      foreach (var tankDir in nation.Directories)
      {
        // if (tankDir.Value.Name != "R90_IS_4")
        //   continue;

        var tank = MangleTank(tankDir.Value);

        if (!tank.Name.Locales.TryGetValue("en", out var nameEn))
        {
          throw new Exception($"Failed to get name for {tankDir.Value.Name}");
        }

        var seoId = Diacritics.Remove(nameEn).ToLower();
        seoId = Regex.Replace(seoId, "[^a-z0-9]", "-");
        seoId = Regex.Replace(seoId, "--+", "-");
        seoId = Regex.Replace(seoId, "-$", "");

        Console.WriteLine($"{nameEn} -> {seoId}");

        TankMeta tankMeta = new() { Id = tank.Id, SeoId = seoId };

        tanks.Tanks_.Add(tankMeta);
      }

      FileChange change = new("definitions/tanks.pb", tanks.ToByteArray());
      changes.Add(change);
    }

    Tank MangleTank(VFS tankDir)
    {
      var pdaName = $"PDA_{tankDir.Name}";
      var pda = provider.LoadObject($"{tankDir.Path}/{pdaName}.{pdaName}");

      var tankId = PropertyUtil.Get<FName>(pda, "TankId").Text;
      Console.WriteLine($"Mangling {tankId}...");

      var hulls = PropertyUtil.Get<UDataTable>(pda, "DT_Hulls");
      UDataTableUtility.TryGetDataTableRow(hulls, "hull", StringComparison.Ordinal, out var hull);
      var hullVisualData = PropertyUtil.Get<UObject>(hull, "VisualData");
      var hullMeshSettings = PropertyUtil.Get<FStructFallback>(hullVisualData, "MeshSettings");
      var hullCollision = PropertyUtil.Get<UStaticMesh>(hullMeshSettings, "CollisionMesh");
      MonoGltf hullCollisionGltf = new(hullCollision);

      changes.Add(new($"tanks/{tankId}/collision/hull.glb", hullCollisionGltf.Write()));

      I18n Name = new();
      Name.Locales.Add("en", tankId);

      return new() { Id = tankId, Name = Name };
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
