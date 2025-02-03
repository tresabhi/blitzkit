using Blitzkit;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Utils;
using CommunityToolkit.HighPerformance;
using CommunityToolkit.HighPerformance.Helpers;
using CUE4Parse_Conversion;
using CUE4Parse_Conversion.Animations;
using CUE4Parse_Conversion.Meshes;
using CUE4Parse_Conversion.Meshes.glTF;
using CUE4Parse_Conversion.Textures;
using CUE4Parse_Conversion.UEFormat.Enums;
using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Exports.Material;
using CUE4Parse.UE4.Assets.Exports.StaticMesh;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Objects.UObject;
using CUE4Parse.UE4.Readers;
using CUE4Parse.UE4.Writers;
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

      MonoGltf hullGltf = new(hullMesh);

      // Gltf gltf = new(hullMesh.Name, hullLod0, null, new() { });
      // FArchiveWriter archiveWriter = new();

      // gltf.Save(EMeshFormat.Gltf2, archiveWriter);

      // MeshExporter hullMeshExporter = new(
      //   hullMesh,
      //   new()
      //   {
      //     MeshFormat = EMeshFormat.Gltf2,
      //     ExportMaterials = true,
      //     ExportMorphTargets = false,
      //     LodFormat = ELodFormat.FirstLod,
      //     TextureFormat = ETextureFormat.Jpeg,
      //     SocketFormat = ESocketFormat.None,
      //     Platform = ETexturePlatform.DesktopMobile,
      //   }
      // );




      // var hullLod0 = hullMeshExporter.MeshLods[0];
      // var hullMeshData = hullLod0.FileData;

      // File.WriteAllBytes($"../../temp/{tankId}.glb", hullMeshData);

      // hullMeshExporter.TryWriteToDir(new("../../temp"), out _, out _);

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
