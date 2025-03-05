using System.Data;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Text.Unicode;
using System.Threading.Tasks;
using Blitzkit;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Quicktype.Locales;
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
using YamlDotNet.Serialization;

namespace BlitzKit.CLI.Functions
{
  public class Mangler(string[] args)
  {
    readonly BlitzProvider provider = new(args.Contains("--depot"));
    Locales? locales;
    readonly List<FileChange> changes = [];
    readonly Dictionary<string, Dictionary<string, string>> strings = [];

    public async Task Mangle()
    {
      await FetchStrings();
      MangleNations();
      // await BlitzKitAssets.CommitAssets("ue assets", changes);
    }

    I18n GetString(string name)
    {
      I18n i18n = new();

      if (strings[locales!.Default].TryGetValue(name, out var defaultString))
      {
        foreach (var locale in locales!.Supported)
        {
          if (strings[locale.Locale].TryGetValue(name, out var localeString))
          {
            if (locale.Locale == locales.Default || localeString != defaultString)
            {
              i18n.Locales[locale.Locale] = localeString;
            }
          }
          else
          {
            PrettyLog.Warn($"String missing from {locale.Locale} locale: {name}");
          }
        }
      }
      else
      {
        PrettyLog.Warn($"String missing from default locale: {name}");
        i18n.Locales[locales!.Default] = name;
      }

      return i18n;
    }

    async Task FetchStrings()
    {
      using var client = new HttpClient();
      var text = File.ReadAllText("../../packages/i18n/locales.json");
      this.locales =
        JsonSerializer.Deserialize<Locales>(text)
        ?? throw new Exception("Failed to deserialize locales");

      foreach (var locale in locales.Supported)
      {
        var blitzLocale = locale.Blitz ?? locale.Locale;
        var url =
          $"{Unpacker.WG_DLC_DOMAIN}/dlc/{Unpacker.CONTENT_GROUP}/ue_localizations/development/general/{blitzLocale}.yaml";
        var yaml = await client.GetStringAsync(url);
        var deserializer = new DeserializerBuilder().Build();
        var parsedYaml = deserializer.Deserialize<Dictionary<string, string>>(yaml);

        strings[locale.Locale] = parsedYaml;
      }
    }

    void MangleNations()
    {
      var dirs = provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories;

      foreach (var dir in dirs)
      {
        if (dir.Key == "TankStub")
          continue;

        MangleNation(dir.Value);
      }
    }

    void MangleNation(VFS nation)
    {
      Tanks tanks = new();

      foreach (var tankDir in nation.Directories)
      {
        // if (tankDir.Value.Name != "R90_IS_4")
        //   continue;

        var tank = MangleTank(tankDir.Value);

        TankMeta tankMeta = new() { Id = tank.Id };

        tanks.Tanks_.Add(tankMeta);
      }

      changes.Add(new("definitions/tanks.pb", tanks.ToByteArray()));
    }

    Tank MangleTank(VFS tankDir)
    {
      var pdaName = $"PDA_{tankDir.Name}";
      var pda = provider.LoadObject($"{tankDir.Path}/{pdaName}.{pdaName}");

      var id = PropertyUtil.Get<FName>(pda, "TankId").Text;

      var name = GetString($"{id}_SHORT_NAME");

      var seoId = Diacritics.Remove(name.Locales["en"]).ToLower();
      seoId = Regex.Replace(seoId, "[^a-z0-9]", "-");
      seoId = Regex.Replace(seoId, "--+", "-");
      seoId = Regex.Replace(seoId, "-$", "");

      // MangleHull(id, pda);

      Console.WriteLine(seoId);

      Tank tank = new()
      {
        Id = id,
        Name = name,
        SeoId = seoId,
      };

      changes.Add(new($"definitions/tanks/{id}.pb", tank.ToByteArray()));

      return tank;
    }

    void MangleHull(string tankId, UObject pda)
    {
      var hulls = PropertyUtil.Get<UDataTable>(pda, "DT_Hulls");
      UDataTableUtility.TryGetDataTableRow(hulls, "hull", StringComparison.Ordinal, out var hull);
      var hullVisualData = PropertyUtil.Get<UObject>(hull, "VisualData");
      var hullMeshSettings = PropertyUtil.Get<FStructFallback>(hullVisualData, "MeshSettings");
      var hullCollision = PropertyUtil.Get<UStaticMesh>(hullMeshSettings, "CollisionMesh");
      MonoGltf hullCollisionGltf = new(hullCollision);

      changes.Add(new($"tanks/{tankId}/collision/hull.glb", hullCollisionGltf.Write()));
    }
  }
}
